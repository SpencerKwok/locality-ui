import * as React from "react";

function SvgFacebookLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={11}
      height={21}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.605 11.146H0V7.598h2.605v-3.03C2.605 2.187 4.145 0 7.691 0c1.436 0 2.498.138 2.498.138l-.084 3.313s-1.083-.01-2.265-.01c-1.279 0-1.483.588-1.483 1.567v2.59h3.85l-.168 3.548H6.357V21H2.605v-9.854z"
        fill="#112378"
      />
    </svg>
  );
}

export default SvgFacebookLogo;
