import ImageTextBlock from "@modules/home/components/image-text-block"

export default function ImageTextBlockTestPage() {
  // Test data that matches the structure from console logs
  const testData = {
    _type: "imageTextBlock" as const,
    isActive: true,
    heading: null, // This was the issue - null heading
    content: null,
    hideTitle: false,
    image: {
      alt: null,
      url: "https://cdn.sanity.io/images/m7o2mv1n/production/13b35b18cf33b747580d7bfdb02e7bb483b1f0ab-1920x960.jpg"
    },
    layout: "imageLeftImageRight" as const,
    leftImage: {
      alt: null,
      url: "https://cdn.sanity.io/images/m7o2mv1n/production/2739203da8b4d077be3e57d84fba1484768e8049-1000x1080.jpg"
    },
    rightImage: {
      alt: null, 
      url: "https://cdn.sanity.io/images/m7o2mv1n/production/20656fc39019503008ea025e91e6a27a0e605a91-997x1080.jpg"
    },
    leftContent: null,
    rightContent: null
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">ImageTextBlock Component Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Case: imageLeftImageRight layout with null heading</h2>
        <p className="text-gray-600 mb-4">
          This should display two images side by side, even though heading is null.
          This was the issue from the console logs - component should now handle null values properly.
        </p>
      </div>

      <div className="border border-gray-300 p-4 rounded">
        <ImageTextBlock
          heading={testData.heading}
          content={testData.content}
          image={testData.image}
          layout={testData.layout}
          leftImage={testData.leftImage}
          rightImage={testData.rightImage}
          leftContent={testData.leftContent}
          rightContent={testData.rightContent}
          hideTitle={testData.hideTitle}
        />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Expected Result:</h3>
        <ul className="list-disc list-inside text-gray-700">
          <li>Two images should be displayed side by side</li>
          <li>No heading should be shown (since heading is null)</li>
          <li>No content should be shown (since content is null)</li>
          <li>Images should be responsive and properly styled</li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Test Data Structure:</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{JSON.stringify(testData, null, 2)}
        </pre>
      </div>
    </div>
  )
}