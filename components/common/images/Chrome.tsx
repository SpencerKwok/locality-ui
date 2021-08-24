import * as React from "react";

function SvgChrome(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 21 21"
      {...props}
    >
      <path
        d="M10.5 13.986a3.486 3.486 0 100-6.972 3.486 3.486 0 000 6.972z"
        fill="#fff"
      />
      <path
        d="M5.892 9.492A4.725 4.725 0 0110.5 5.783h9.387a10.524 10.524 0 00-1.962-2.708A10.431 10.431 0 0010.5 0a10.432 10.432 0 00-7.425 3.075c-.19.191-.373.388-.547.59l3.364 5.827z"
        fill="#fff"
      />
      <path
        d="M11.93 14.995a4.72 4.72 0 01-5.528-2.16l-.016-.028-4.663-8.075A10.427 10.427 0 000 10.5c0 2.805 1.092 5.441 3.075 7.425a10.425 10.425 0 005.49 2.898l3.366-5.828z"
        fill="#fff"
      />
      <path
        d="M13.674 7.014a4.706 4.706 0 01.896 5.867l-.012.024-4.663 8.077a10.431 10.431 0 008.03-3.058A10.431 10.431 0 0021 10.5c0-1.206-.203-2.381-.59-3.486h-6.736z"
        fill="#fff"
      />
    </svg>
  );
}

export default SvgChrome;
