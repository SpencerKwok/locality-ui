import * as React from "react";
function SvgPartner14(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={176}
      height={176}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <g filter="url(#partner-1-4_svg__filter0_d)">
        <circle
          cx={88}
          cy={88}
          r={64}
          fill="url(#partner-1-4_svg__pattern0)"
          shapeRendering="crispEdges"
        />
      </g>
      <defs>
        <pattern
          id="partner-1-4_svg__pattern0"
          patternContentUnits="objectBoundingBox"
          width={1}
          height={1}
        >
          <use xlinkHref="#partner-1-4_svg__image0" transform="scale(.00049)" />
        </pattern>
        <filter
          id="partner-1-4_svg__filter0_d"
          x={0}
          y={0}
          width={176}
          height={176}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation={12} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0.641667 0 0 0 0 0.633646 0 0 0 0 0.633646 0 0 0 0.15 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
        <image
          id="partner-1-4_svg__image0"
          width={2048}
          height={2048}
        />
      </defs>
    </svg>
  );
}
export default SvgPartner14;