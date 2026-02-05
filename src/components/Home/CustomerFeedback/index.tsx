"use client"
import Image from 'next/image'

const CustomerFeedback = () => {

    return (
        <section>
            <div className='bg-secondary py-20 sm:py-28'>
                <div className="container">
                    <div className='flex flex-col gap-16'>
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                            <div className="flex flex-col gap-4 max-w-xl">
                                <div className="bg-gray w-fit flex-1 rounded-full py-1 px-4">
                                    <p className="font-semibold text-white">What our clients say</p>
                                </div>
                                <h2 className="font-semibold text-white">Feedback from satisfied customers.</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CustomerFeedback
