const SERVICES = [
  { slug: "regular-cleaning", nombre: "Regular Cleaning", precio: "$112.00" },
  { slug: "deep-cleaning", nombre: "Deep Cleaning", precio: "$245.00" },
  { slug: "move-in-out-cleaning", nombre: "Move-In / Move-Out", precio: "$300.00" },
  { slug: "carpet-cleaning", nombre: "Carpet Cleaning", precio: "$40.00" },
];

export default function TwoColumnSection() {
  return (
    <section className="bg-secondary bg-[length:auto_100%] bg-[linear-gradient(0deg,rgba(15,23,26,0.55)_0%,rgba(15,23,26,0.55)_100%),url('/images/services/professional-commercial-cleaning.webp')] lg:bg-[linear-gradient(0deg,rgba(15,23,26,0.7)_0%,rgba(15,23,26,0.35)_45%,rgba(15,23,26,0)_100%),url('/images/services/professional-commercial-cleaning.webp')] bg-no-repeat bg-center min-h-[800px] flex items-center">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 items-center">
          <div className="flex-1 bg-blue-500/30 p-6 rounded-lg max-w-[50%] lg:self-end">
            <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
              <p className="font-semibold text-white">Integrity Cleaning</p>
            </div>
            <h1 className="text-white text-3xl md:text-4xl font-semibold mt-3">Professional Cleaning Services Orlando | Integrity Clean</h1>
            <p className="text-white/80 text-lg sm:text-xl mt-3">Integrity Clean Solutions delivers eco-friendly cleaning across Orlando, keeping homes and workplaces fresh, healthy, and ready for every day.</p>
          </div>
          <div className="flex-1 bg-white dark:bg-dark-gray rounded-lg p-8 max-w-[50%]">
            <h3 className="text-xl md:text-2xl font-semibold dark:text-white mb-6">Get a Free Quote</h3>
            <form className="flex flex-col gap-5">
              <div>
                <input type="text" name="name" placeholder="Full name *" className="input-field" />
              </div>
              <div>
                <input type="tel" name="number" placeholder="Phone number *" className="input-field" />
              </div>
              <div>
                <input type="email" name="email" placeholder="Email address *" className="input-field" />
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-semibold text-dusty-gray dark:text-white/90">Select a Service</p>
                {SERVICES.map((service) => (
                  <div key={service.slug} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input type="checkbox" name={service.slug} id={service.slug} className="w-5 h-5" />
                      <label htmlFor={service.slug} className="text-dusty-gray dark:text-white/70 ml-2 cursor-pointer">
                        {service.nombre}
                      </label>
                    </div>
                    <span className="text-primary font-semibold">{service.precio}</span>
                  </div>
                ))}
              </div>
              <div>
                <button type="submit" className="w-full py-3 px-6 bg-primary hover:bg-deep-blue transition-colors duration-300 rounded-sm cursor-pointer">
                  <span className="text-base text-white font-bold">Get started today</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
