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
                sizes="(max-width: 768px) 140px, 180px"
                className="h-[3.75rem] w-auto dark:invert"
                priority
            />
        </Link>
    );
};

export default Logo;
