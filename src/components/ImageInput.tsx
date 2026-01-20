import { useState } from "react";
import { apiUploadImage } from '../apis/product'
import type { ApiErrorResponse } from "../types/user"
import { handleResponse } from '../utils/responseMessage'
import axios from "axios"

type ImageInputProps = {
  onUploaded: (url: string) => void
}

export const ImageInput = ({onUploaded}: ImageInputProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [tempFileName, setTempFileName] = useState('')
  const [formData, setFormData] = useState<FormData | null>(null)
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file-to-upload', file)
    setFormData(formData)
    setTempFileName(file.name)
  }

  const uploadImage = async () => {
    if (!formData) return
    try {
      setIsUploading(true)
      const response = await apiUploadImage(formData)
      console.log(response.data)
      onUploaded(response.data.imageUrl)
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        handleResponse(
          error.response?.data.message ?? '上傳圖片失敗',
          'warning'
        )
      } else {
        handleResponse('未知錯誤', 'error')
      }
    } finally {
      setIsUploading(false)
      setTempFileName('')
      setFormData(null)
    }
  }
  return (
    <div className="input-group mb-2">
      <label className="input-group-text rounded-lg" htmlFor="imageInputFile">選擇圖片</label>
      <input
        type="file"
        className="form-control d-none"
        id="imageInputFile"
        accept=".jpg, .jpeg, .png"
        onChange={handleFileChange}
        />
      <div className="file-name-display form-control rounded-lg">
        {tempFileName}
      </div>
      <button
        className={`btn rounded-lg ms-2 ${formData ? 'btn-outline-primary': 'btn-outline-secondary'}`}
        type="button"
        onClick={uploadImage}
        disabled={isUploading}
        >
        {
          isUploading ?
          <span
          className="spinner-border spinner-border-sm me-1"
          role="status"
          aria-hidden="true"
          ></span>
          : ''
        }
        { isUploading ? '上傳中...' : '上傳圖片' }
      </button>
    </div>
  )
}