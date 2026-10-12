import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="MBAProf Tests"
        width={1794}
        height={372}
        className="h-8 w-auto object-contain"
        sizes="160px"
        priority
      />
    </Link>
  );
}
