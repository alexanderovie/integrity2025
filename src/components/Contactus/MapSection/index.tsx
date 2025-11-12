import Image from "next/image"

const MapSection = () => {
    return (
        <div className='py-28 dark:bg-dark-gray'>
            <div className="container">
                <div className="w-full h-full flex justify-center">
                    <Image src="/images/contactus/map-image.svg" alt="map-image" width={1042} height={339} className="w-full h-full object-cover"/>
                </div>
            </div>
        </div>
    )
}

export default MapSection