import Swal from 'sweetalert2'
import { apiDeleteProduct } from '../apis/product'


type ConfirmDeleteModalProps = {
  productId: string
  productTitle: string
  onDeleted: () => void
}

const deleteProduct = async (id: string) => {
  const response = await apiDeleteProduct(id)
  return response.data
}

export const ConfirmDeleteModel = ({
  productId,
  productTitle,
  onDeleted
}: ConfirmDeleteModalProps) => {
  const showAlert = async () => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-outline-danger me-2',
      },
      buttonsStyling: false,
    })

    const result = await swalWithBootstrapButtons.fire({
      title: '確定刪除產品?',
      text: `即將刪除: ${productTitle}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '刪除',
      cancelButtonText: '取消',
      reverseButtons: true,
    })

    if (!result.isConfirmed) {
      await swalWithBootstrapButtons.fire({
        title: '已取消',
        text: 'Nothing happened! :)',
        icon: 'info',
      })
      return
    }

    try {
      await deleteProduct(productId)

      await swalWithBootstrapButtons.fire({
        title: 'Done!',
        text: '產品已刪除!',
        icon: 'success',
      })
      onDeleted()
    } catch (error) {
      await swalWithBootstrapButtons.fire({
        title: '刪除失敗',
        text: '請稍後再試',
        icon: 'error',
      })
    }
  }

  return (
    <button
      onClick={showAlert}
      type="button"
      className="btn btn-outline-danger btn-sm"
    >
      刪除
    </button>
  )
}