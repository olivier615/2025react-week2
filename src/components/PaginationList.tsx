import type { TPagination } from "../types/product"
type PaginationListProps = {
  pagination: TPagination
  onChangePage: (page: number) => void
}

export const PaginationList = ({ pagination, onChangePage }: PaginationListProps) => {
  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
          <button 
            onClick={() => onChangePage(pagination.current_page - 1)}
            className="page-link" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </button>
        </li>
          {Array.from({ length: pagination.total_pages }, (_, index) => {
          const page = index + 1
          return (
            <li
              key={page}
              className={`page-item ${page === pagination.current_page ? 'active' : ''}`}
            >
              <button className="page-link"
                onClick={() => onChangePage(page)}
              >
                {page}
              </button>
            </li>
          )
        })}
        <li className={`page-item ${pagination.current_page === pagination.total_pages ? 'disabled' : ''}`}>
          <button
            onClick={() => onChangePage(pagination.current_page + 1)}
            className="page-link" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}