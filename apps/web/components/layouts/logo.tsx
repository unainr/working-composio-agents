import Image from "next/image";
import Link from "next/link";

const Logo = () => {
	return (
		<Link href="/" className="flex items-center gap-2 ">
			<Image
				className="h-auto w-auto hidden dark:block"
				src="/logo2.png" // or your public path
				alt="amanises Logo"
				width={120}
				height={50}
				priority
			/>
			<Image
				src="/logo1.png" // or your public path
						alt="amanises Logo"

				width={120}
				height={50}
				priority
				className="h-auto w-auto object-contain dark:hidden block"
			/>
		</Link>
	);
};

export default Logo;