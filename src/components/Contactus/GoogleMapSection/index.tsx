const GoogleMapSection = () => {
    return (
        <div className="py-28 dark:bg-dark-gray">
            <div className="container">
                <div className="w-full h-[450px] flex justify-center">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.0123456789!2d-81.4012345!3d28.5412345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88e77d1234567890%3A0x1234567890abcdef!2s4700%20Millenia%20Blvd%2C%20Orlando%2C%20FL%2032839!5e0!3m2!1sen!2sus!4v1234567890!5m2!1sen!2sus"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Google Map - Integrity Clean Solutions"
                        className="w-full h-full object-cover rounded-lg"
                    />
                </div>
            </div>
        </div>
    )
}

export default GoogleMapSection
