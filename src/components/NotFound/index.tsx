import Image from "next/image";
import Link from "next/link";

const NotFound = () => {
  return (
    <section>
      <div className="pt-32 dark:bg-dark-gray">
        <div className="container">
          <div className="flex flex-col py-24 gap-10 justify-center items-center ">
            <div className="w-full h-full flex justify-center items-center">
              <Image src={"/images/notfound/404.svg"} alt="Image" height={150} width={550} className="dark:hidden" />
              <Image src={"/images/notfound/404-dark.svg"} alt="Image" height={150} width={550} className="hidden dark:block" />
            </div>
            <div className="flex flex-col gap-5 items-center text-center">
              <h2 className="font-semibold">Oops! Page Not Found</h2>
              <Link href="/" className="bg-primary hover:bg-darkPrimary w-fit py-3.5 px-6 rounded-md font-semibold cursor-pointer dark:text-secondary">
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
