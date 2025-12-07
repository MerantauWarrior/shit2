export default function Page(){
  return(
    <div className="flex flex-1 flex-col gap-4">
      <h1>Dashboard</h1>
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="bg-muted/50 aspect-video h-12 w-full rounded-lg"
        />
      ))}
    </div>
  )
}
