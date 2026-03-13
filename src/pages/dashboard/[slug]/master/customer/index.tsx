import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CustomerTable, Customer } from '@/components/features/customer/CustomerTable';
import { CustomerFormModal, CustomerFormData } from '@/components/features/customer/CustomerFormModal';
import { DeleteCustomerModal } from '@/components/features/customer/DeleteCustomerModal';
import { toast } from 'sonner';

// DUMMY DATA INITIALIZATION
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 1,
    namaDealer: "Yamaha Sejati Yogyakarta",
    namaCustomer: "ELLA YOUNG WIDJAYANTO NUGRAHA",
    pic: "Emilia Clarke",
    alamat: "Jl. Raya Kalimalang No, Rt 000, Rw 000, Duren Sawit, Duren Sawit, Kota Adm. Jakarta Timur, DKI Jakarta 00000",
    maps: "https://maps.app.goo.gl/example",
    phone: "08xx xxxx xxxx"
  },
  {
    id: 2,
    namaDealer: "Yamaha Tugu Jogja",
    namaCustomer: "BUDI SANTOSO",
    pic: "John Doe",
    alamat: "Jl. Pangeran Diponegoro No 10, Gowongan, Jetis, Kota Yogyakarta, DIY 55233",
    maps: "https://maps.app.goo.gl/example",
    phone: "0812 3456 7890"
  },
  {
    id: 3,
    namaDealer: "Honda Nusantara Abadi",
    namaCustomer: "SITI RAHMAWATI",
    pic: "Jane Smith",
    alamat: "Jl. Magelang KM 5.5, Kutu Patran, Sinduadi, Mlati, Kabupaten Sleman, DIY 55284",
    maps: "https://maps.app.goo.gl/example",
    phone: "0857 1122 3344"
  },
  {
    id: 4,
    namaDealer: "Suzuki Sumber Baru",
    namaCustomer: "AHMAD FAUZI",
    pic: "Tom Holland",
    alamat: "Jl. Laksda Adisucipto No 15, Ambarukmo, Caturtunggal, Depok, Sleman, DIY 55281",
    maps: "https://maps.app.goo.gl/example",
    phone: "0878 9988 5544"
  },
  {
    id: 5,
    namaDealer: "Toyota Nasmoco Jogja",
    namaCustomer: "DEWI KARTIKA",
    pic: "Emma Watson",
    alamat: "Jl. Ringroad Utara, Jombor Kidul, Sinduadi, Mlati, Kabupaten Sleman, DIY 55284",
    maps: "https://maps.app.goo.gl/example",
    phone: "0819 6633 2211"
  },
];

export default function CustomerPage() {
  // Data state
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  // Table state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Filter & Pagination logic
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      customer.namaDealer.toLowerCase().includes(search.toLowerCase()) ||
      customer.namaCustomer.toLowerCase().includes(search.toLowerCase()) ||
      customer.pic.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search)
    );
  }, [customers, search]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    return filteredCustomers.slice(startIndex, startIndex + perPage);
  }, [filteredCustomers, page, perPage]);

  // Handlers
  const handleAddClick = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  const handleSaveForm = (data: CustomerFormData) => {
    if (selectedCustomer) {
      // Edit
      setCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...c, ...data } : c));
      toast.success('Data customer berhasil diubah');
    } else {
      // Add
      const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
      setCustomers([{ id: newId, ...data }, ...customers]);
      toast.success('Data customer berhasil ditambahkan');
    }
    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedCustomer) {
      setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
      toast.success('Data customer berhasil dihapus');
      setIsDeleteOpen(false);
      setSelectedCustomer(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Customer</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data customer dengan mudah</p>
        </div>

        {/* Content */}
        <CustomerTable
          customers={paginatedCustomers}
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          page={page}
          perPage={perPage}
          totalData={filteredCustomers.length}
          onPageChange={setPage}
          onPerPageChange={(v) => { setPerPage(v); setPage(1); }}
          onAdd={handleAddClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* Modals */}
      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveForm}
        initialData={selectedCustomer}
      />

      <DeleteCustomerModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  );
}
