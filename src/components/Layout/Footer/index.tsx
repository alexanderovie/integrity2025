import React from 'react'
import Newsletter from './Newsletter'
import FooterInfo from './FooterInfo'
import FooterCopyright from './FooterCopyright'

const Footer = () => {
    return (
        <footer>
            <div className='relative z-10 pt-14 md:pt-28 bg-foggy-clay dark:bg-secondary'>
                <Newsletter />
                <FooterInfo/>
                <FooterCopyright/>
            </div>
        </footer>
    )
}

export default Footer
