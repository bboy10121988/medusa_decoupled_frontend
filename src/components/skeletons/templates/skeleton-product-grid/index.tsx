import repeat from "@lib/util/repeat"
import SkeletonProductPreview from "@components/skeletons/components/skeleton-product-preview"

const SkeletonProductGrid = ({
  numberOfProducts = 8,
}: {
  numberOfProducts?: number
}) => {
  return (
    <ul
      className="grid grid-cols-2 md:grid-cols-4 gap-0 w-full bg-neutral-200"
      data-testid="products-list-loader"
    >
      {repeat(numberOfProducts).map((index) => (
        <li key={index} className="w-full bg-white">
          <SkeletonProductPreview />
        </li>
      ))}
    </ul>
  )
}

export default SkeletonProductGrid
