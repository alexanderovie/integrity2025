import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {
    return (
        <Link href="/">
            <Image
                src="/images/logo/integrity-navbar.png"
                alt="Integrity Clean Solutions – Residential & Commercial Cleaning in Orlando, FL"
                width={1600}
                height={538}
                className="h-[3.125rem] w-auto"
                priority
                quality={90}
            />
        </Link>
    );
};

export default Logo;
