import TableDevice from '@/components/tables/table-device'

export default function Page(){
  return(
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-semibold mb-4">Devices</h1>
          </div>
          <div className="px-4 lg:px-6 w-full max-w-full overflow-x-hidden">
            <TableDevice />
          </div>
        </div>
      </div>
    </div>
  )
}
