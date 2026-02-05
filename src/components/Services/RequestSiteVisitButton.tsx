"use client";

type RequestSiteVisitButtonProps = {
  className?: string;
  label?: string;
  serviceSlug?: string;
};

const RequestSiteVisitButton = ({
  className,
  label = "Request a Site Visit",
  serviceSlug = "commercial-cleaning",
}: RequestSiteVisitButtonProps): React.ReactElement => {
  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-book-services-modal", {
          detail: { mode: "site-visit", serviceSlug },
        })
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
    >
      {label}
    </button>
  );
};

export default RequestSiteVisitButton;
