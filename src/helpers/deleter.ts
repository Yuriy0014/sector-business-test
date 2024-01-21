import { promises as fs } from 'fs'
import * as path from 'path'

export async function deletePhoto(photoName: string): Promise<void> {
  const photoPath = `uploads/${photoName}`

  try {
    await fs.unlink(photoPath)
    console.log('Файл успешно удален')
  } catch (e) {
    console.log(`Ошибка при удалении файла: ${e}`)
  }
}

export async function clearDirectory(directoryPath: string): Promise<void> {
  try {
    if (await fs.stat(directoryPath).catch(() => false)) {
      const files = await fs.readdir(directoryPath)

      for (const file of files) {
        const curPath = path.join(directoryPath, file)
        const stat = await fs.lstat(curPath)

        if (stat.isDirectory()) {
          await clearDirectory(curPath)
        } else {
          await fs.unlink(curPath)
        }
      }
    }
    console.log('Папка успешно очищена')
  } catch (e) {
    console.log(`Ошибка при очистки папки : ${e}`)
  }
}
