import Image from 'next/image'

const AboutusBanner = () => {
  return (
    <section>
      <div className="relative pt-24 lg:pt-32">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/home/banner/hero-bg.png"
            alt="About Integrity Clean Solutions - Orlando Cleaning Experts"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="container relative z-10">
          <div className='relative flex flex-col gap-10 lg:gap-16 xl:gap-20 pt-14 lg:pt-28 pb-24 lg:pb-32 z-10'>
            <div className='flex flex-col items-center gap-5 lg:gap-10 text-center'>
              <div className='flex flex-col gap-3 lg:max-w-2xl w-full items-center'>
                <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                  <p className="font-semibold text-white">Integrity Cleaning</p>
                </div>
                <h1 className='text-white font-semibold text-3xl md:text-4xl'>About Integrity Clean Solutions | Orlando Cleaning Experts</h1>
              </div>
              <div className="max-w-2xl">
                <p className='text-white text-lg'>We deliver reliable residential and commercial cleaning across Orlando, with consistent crews, clear communication, and results you can see every time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutusBanner
