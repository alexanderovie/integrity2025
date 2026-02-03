import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {
    return (
        <Link href="/">
            <Image
                src="/images/logo/logo.svg"
                alt="Integrity Clean Solutions – Residential & Commercial Cleaning in Orlando, FL"
                width={1600}
                height={538}
                className="h-[3.75rem] w-auto dark:hidden"
                priority
                quality={90}
            />
            <Image
                src="/images/logo/dark-logo.svg"
                alt="Integrity Clean Solutions – Residential & Commercial Cleaning in Orlando, FL"
                width={1600}
                height={538}
                className="hidden h-[3.75rem] w-auto dark:block"
                priority
                quality={90}
            />
        </Link>
    );
};

export default Logo;
