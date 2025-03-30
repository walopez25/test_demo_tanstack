import { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type User = {
  id: number;
  name: string;
  email: string;
};

// Función para obtener datos desde la API
const fetchUsers = async (page: number, pageSize: number) => {
  const { data } = await axios.get(`http://localhost:8000/api/users`, {
    params: { page, size: pageSize },
  });

  return data;
};

const DataTable = () => {

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Query para obtener los datos de la API
  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["users", pageIndex, pageSize],
    queryFn: () => fetchUsers(pageIndex + 1, pageSize), 
    staleTime: 5000, // Mantiene datos en caché durante 5s antes de refetch
  });

  // Definir columnas de la tabla
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Nombre" },
      { accessorKey: "email", header: "Correo Electrónico" },
    ],
    []
  );

  // Crear tabla
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination: { pageIndex, pageSize } },
    manualPagination: true, // Paginación controlada por el backend
    pageCount: data?.totalPages ?? -1, // Manejo total de páginas
  });

  // Manejo de errores y carga
  console.log('#### data: ', data)
  if (isLoading) return <p className="text-center mt-4">Cargando datos...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">Error al cargar los datos</p>;
  if (!data?.length) return <p className="text-center mt-4">No hay datos disponibles</p>;

  return (
    <div className="p-4">
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead className="bg-gray-800 text-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border border-gray-300 px-4 py-2">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border border-gray-300">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border border-gray-300 px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Controles de paginación */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setPageIndex((old) => Math.max(old - 1, 0))}
          disabled={pageIndex === 0}
          className="px-3 py-2 bg-gray-800 text-white rounded disabled:bg-gray-400"
        >
          Anterior
        </button>

        <button
          onClick={() => setPageIndex((old) => old + 1)}
          disabled={data.length < pageSize}
          className="ml-2 px-3 py-2 bg-gray-800 text-white rounded disabled:bg-gray-400"
        >
          Siguiente
        </button>

        <select
          className="px-2 py-1 border rounded"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPageIndex(0); // Resetear a la primera página
          }}
        >
          {[5, 10, 20].map((size) => (
            <option key={size} value={size}>
              {size} filas
            </option>
          ))}
        </select>

        <span>
          Página <strong>{pageIndex + 1}</strong>
        </span>

        {isFetching && <p className="text-gray-500 text-sm">Cargando...</p>}
      </div>
    </div>
  );
};

export default DataTable;