import * as React from "react";

function SvgHeartFilled(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="#fe5448"
      viewBox="8 10 34 29.7"
      {...props}
    >
      <path d="M25 39.7l-.6-.5C11.5 28.7 8 25 8 19c0-5 4-9 9-9 4.1 0 6.4 2.3 8 4.1 1.6-1.8 3.9-4.1 8-4.1 5 0 9 4 9 9 0 6-3.5 9.7-16.4 20.2l-.6.5z" />
    </svg>
  );
}

export default SvgHeartFilled;
