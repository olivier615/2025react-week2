type ImageCardProps = {
  url: string,
  onDelete:  () => void
  onSetMainImage:  () => void
}

export const ImageCard = ({url,onDelete, onSetMainImage}: ImageCardProps) => {
// next to do 設置為主要圖片

  return (
    <div className="card p-2">
      <img className="img-fluid mb-1"  src={url} alt={url} />
        <div className="btn-group" role="group">
            <button type="button" className="btn btn-outline-primary btn-sm"
              onClick={onSetMainImage}
            >
              設為主要圖片
            </button>
            <button type="button" className="btn btn-outline-danger btn-sm"
              onClick={onDelete}
            >
              刪除圖片
            </button>
        </div>
      </div>)
}