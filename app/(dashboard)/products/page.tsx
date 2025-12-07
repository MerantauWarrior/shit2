import Link from "next/link";

export default function Page(){
  return(
    <div>
      <h1>Products</h1>
      <Link href={"/products/123"}>post 123</Link>
    </div>
  )
}