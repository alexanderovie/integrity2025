import Marquee from "react-fast-marquee";
import { promobarData } from "./data";

function Promobar() {
    return (
        <section>
            <div className="bg-deep-blue flex">
                <Marquee autoFill gradient={false}>
                    {promobarData.map((value, index) => {
                        return (
                            <div key={index} className="flex items-center py-2.5 gap-6 pr-6 md:pr-10 md:gap-10">
                                <p className="font-medium text-white">{value}</p>
                                <div className="w-16 h-[1px] bg-white/40" />
                            </div>
                        )
                    })}
                </Marquee>
            </div>
        </section>
    )
}
export default Promobar;
