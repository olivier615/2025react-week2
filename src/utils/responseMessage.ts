import Swal from "sweetalert2"

type SwalIcon = 'success' | 'error' | 'warning' | 'info' | 'question'

export const handleResponse = (message: string, icon: SwalIcon) => {
  Swal.fire({
    title: message,
    icon,
    draggable: false,
  })
}
