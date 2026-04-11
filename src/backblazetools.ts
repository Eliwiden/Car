import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

interface B2AuthResponse {
  apiUrl: string;
  authorizationToken: string;
  downloadUrl: string;
}

interface B2UploadConfig {
  keyId: string;
  applicationKey: string;
  bucketId: string;
  bucketName: string;
}
export interface B2File {
  fileName: string;
  fileId: string;
  size: number;
  uploadTimestamp: number;
}

/**
 * Загружает текстовый файл в B2 Cloud Storage
 * @param config Конфигурация для доступа к B2
 * @param fileName Имя файла для сохранения в B2
 * @param fileContent Содержимое текстового файла
 * @param contentType MIME-тип содержимого (по умолчанию 'text/plain')
 * @returns Promise с URL загруженного файла
 */

const config: B2UploadConfig = {
  keyId: '5eb0d3d5f424',
  applicationKey: '00385f68b02653ad3c528c7863d4ccbd039e981f15',
  bucketId: '35beebf07d235d859fd40214',
  bucketName: "Car-Racing"
};

async function authorizeB2(): Promise<B2AuthResponse> {
  const response = await axios.get(
      'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
      {auth: {username: config.keyId, password: config.applicationKey}}
    ) as {data:B2AuthResponse};
  return response.data
}

let oAuthResponse:B2AuthResponse|null = null;

export function SetExternAuthCreds(sEncCreds:string){
    if(oAuthResponse || !sEncCreds) return;
    const sCreds = decrypt(sEncCreds);
    oAuthResponse = JSON.parse(sCreds);
}

export function GetExternAuthCreds(){
    if(!oAuthResponse) return "";
    return encrypt(JSON.stringify(oAuthResponse));
}

export async function WriteTextFileToB2(fileName: string, fileContent: string, contentType: string = 'text/plain', bSecondCall?:boolean){
  try {
    if(!oAuthResponse){
        oAuthResponse = await authorizeB2();
    }
    const { authorizationToken, apiUrl } = oAuthResponse;

    fileName = fileName.replaceAll(" ", "_");
    // 2. Получение URL для загрузки
    const uploadUrlResponse = await axios.post(
      `${apiUrl}/b2api/v2/b2_get_upload_url`,
      {bucketId: config.bucketId},
      {headers: {Authorization: authorizationToken}}
    );

    const { uploadUrl, authorizationToken: uploadAuthToken } = uploadUrlResponse.data;

    // 3. Подготовка данных
    const contentBuffer = Buffer.from(fileContent, 'utf-8');

    // 4. Настройка конфигурации загрузки
    const uploadConfig: AxiosRequestConfig = {method: 'post', url: uploadUrl, data: contentBuffer,
      headers: {
        Authorization: uploadAuthToken,
        'X-Bz-File-Name': fileName,
        'Content-Type': contentType,
        'X-Bz-Content-Sha1': 'do_not_verify',
        'X-Bz-Info-Author': 'unknown',
      },
      maxContentLength: Infinity,
    };

    await axios(uploadConfig);
    console.log("file " + fileName + " uploaded");
    return 0;
  } catch (error: any) {
    if (error.response?.data?.code === 'expired_auth_token' && !bSecondCall) {
        oAuthResponse = null;
        await WriteTextFileToB2(fileName, fileContent, contentType, true);
        return 1;
    }
    console.error(`Failed to upload file to B2: ${error.response?.data?.message || error.message}`)
    throw new Error(`Failed to upload file to B2: ${error.response?.data?.message || error.message}`);
  }
}


export async function ReadTextFileFromB2(filePath: string, bSecondCall?:boolean): Promise<any> {
  try {
    if(!oAuthResponse){
        oAuthResponse = await authorizeB2();
    }
    const { authorizationToken, downloadUrl } = oAuthResponse;
    filePath = filePath.replaceAll(" ", "_");
    const fileUrl = `${downloadUrl}/file/${config.bucketName}/${encodeURIComponent(filePath)}`;

    // 3. Настройка запроса на скачивание
    const downloadConfig: AxiosRequestConfig = {
      method: 'get',
      url: fileUrl,
      headers: {Authorization: authorizationToken},
      responseType: 'text', // Указываем, что ожидаем текстовый ответ
    };

    const response: AxiosResponse<any> = await axios(downloadConfig);
    return response.data;

  } catch (error: any) {
    if (error.response?.data?.code === 'expired_auth_token' && !bSecondCall) {
        oAuthResponse = null;
        return await ReadTextFileFromB2(filePath, true);
    }
    console.error(`Failed to read file ${filePath} from B2: ${error.response?.data?.message || error.message}`)
    throw new Error(`Failed to read file from B2: ${error.response?.data?.message || error.message}`);
  }
}

// Ключ должен быть 32 байта (256 бит) для AES-256
const ENCRYPTION_KEY = scryptSync('0LH4kNkXuBEyMf3B5uRK6.ukXMeCl7kNfq7BTT', 'a7f3e9d2c4b8a1e5f6d3c9b2a4e8f1d7c5b3a9e6f2d8c4b7a1e5f9d3c6b8a2e4', 32); // На практике используйте .env
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // 16 байт для AES-CBC

/**
 * Шифрует строку в единую Base64 строку (IV + зашифрованные данные)
 * @param text - Текст для шифрования
 * @returns Base64 строка
 */
export function encrypt(text: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final()
    ]);
    
    return Buffer.concat([iv, encrypted]).toString('base64');
}

/**
 * Дешифрует строку из Base64
 * @param encryptedBase64 - Base64 строка от encrypt()
 * @returns Расшифрованная строка
 */
export function decrypt(encryptedBase64: string): string {
    const buffer = Buffer.from(encryptedBase64, 'base64');
    const iv = buffer.subarray(0, IV_LENGTH);
    const encryptedData = buffer.subarray(IV_LENGTH);
    
    const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    // Исправленная строка - убраны ненужные параметры кодировки
    const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
    ]);
    
    return decrypted.toString('utf8');
}