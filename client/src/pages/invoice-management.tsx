import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Printer, 
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { printInvoice, exportToPDF, type TemplateSize } from "@/utils/print-utils";
import { InvoiceTemplateA4 } from "@/components/invoice-template-a4";
import { InvoiceTemplate58mm } from "@/components/invoice-template-58mm";
import { InvoiceTemplate80mm } from "@/components/invoice-template-80mm";
import type { InvoiceWithItems } from "@shared/schema";

type SortField = "invoiceNumber" | "total" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

export default function InvoiceManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Fetch invoices
  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ["/api/invoices"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/invoices");
      return response.json();
    },
  });

  const invoices: InvoiceWithItems[] = invoicesData || [];

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/invoices/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  // Update invoice status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/invoices/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive",
      });
    },
  });

  // Filter and sort invoices
  const filteredAndSortedInvoices = invoices
    .filter((invoice) => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.company?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case "invoiceNumber":
          aValue = a.invoiceNumber;
          bValue = b.invoiceNumber;
          break;
        case "total":
          aValue = parseFloat(a.total);
          bValue = parseFloat(b.total);
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt!);
          bValue = new Date(b.createdAt!);
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "saved":
        return <Badge className="bg-blue-100 text-blue-800">Saved</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePrintInvoice = (invoice: InvoiceWithItems, templateSize: TemplateSize = "A4") => {
    // Create temporary element for the invoice template
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.id = `temp-invoice-${invoice.id}`;
    document.body.appendChild(tempDiv);

    // Format the date properly
    const formattedDate = new Date(invoice.createdAt!).toLocaleString('en-US', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    // Render the invoice template using React
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(tempDiv);
      
      let TemplateComponent;
      switch (templateSize) {
        case "58mm":
          TemplateComponent = InvoiceTemplate58mm;
          break;
        case "80mm":
          TemplateComponent = InvoiceTemplate80mm;
          break;
        default:
          TemplateComponent = InvoiceTemplateA4;
      }

      root.render(
        React.createElement(TemplateComponent, {
          company: {
            name: invoice.company?.name || "Jaberco",
            address: invoice.company?.address || "2480 Cawthra Rd #16, Mississauga, ON",
            phone: invoice.company?.phone || "+1 289 216 6500",
            website: invoice.company?.website || "www.jaberco.ca",
            taxRate: invoice.company?.taxRate || 13
          },
          items: invoice.items,
          invoiceNumber: invoice.invoiceNumber,
          currentDate: formattedDate,
          isPrintMode: true
        })
      );

      // Wait for the component to render, then print
      setTimeout(() => {
        printInvoice(templateSize, tempDiv.id);
        // Clean up
        setTimeout(() => {
          document.body.removeChild(tempDiv);
        }, 1000);
      }, 500);
    });
  };

  const handleExportInvoicePDF = (invoice: InvoiceWithItems, templateSize: TemplateSize = "A4") => {
    // Create temporary element for the invoice template
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.id = `temp-invoice-pdf-${invoice.id}`;
    document.body.appendChild(tempDiv);

    // Format the date properly
    const formattedDate = new Date(invoice.createdAt!).toLocaleString('en-US', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    // Render the invoice template using React
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(tempDiv);
      
      let TemplateComponent;
      switch (templateSize) {
        case "58mm":
          TemplateComponent = InvoiceTemplate58mm;
          break;
        case "80mm":
          TemplateComponent = InvoiceTemplate80mm;
          break;
        default:
          TemplateComponent = InvoiceTemplateA4;
      }

      root.render(
        React.createElement(TemplateComponent, {
          company: {
            name: invoice.company?.name || "Jaberco",
            address: invoice.company?.address || "2480 Cawthra Rd #16, Mississauga, ON",
            phone: invoice.company?.phone || "+1 289 216 6500",
            website: invoice.company?.website || "www.jaberco.ca",
            taxRate: invoice.company?.taxRate || 13
          },
          items: invoice.items,
          invoiceNumber: invoice.invoiceNumber,
          currentDate: formattedDate,
          isPrintMode: true
        })
      );

      // Wait for the component to render, then export to PDF
      setTimeout(() => {
        exportToPDF(templateSize, tempDiv.id);
        // Clean up
        setTimeout(() => {
          document.body.removeChild(tempDiv);
        }, 1000);
      }, 500);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jaberco-blue mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading invoices...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
              <p className="text-gray-600 mt-1">Manage and track all your invoices</p>
            </div>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-jaberco-blue hover:bg-blue-700"
              data-testid="button-create-invoice"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Invoice
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-invoices"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40" data-testid="select-status-filter">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="saved">Saved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Invoices ({filteredAndSortedInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredAndSortedInvoices.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">No invoices found</p>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  Create Your First Invoice
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("invoiceNumber")}
                      >
                        <div className="flex items-center gap-2">
                          Invoice Number
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("total")}
                      >
                        <div className="flex items-center gap-2">
                          Total
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("createdAt")}
                      >
                        <div className="flex items-center gap-2">
                          Date
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          {invoice.company?.name || "No Company"}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            ${parseFloat(invoice.total).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invoice.status)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {format(new Date(invoice.createdAt!), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                data-testid={`button-actions-${invoice.id}`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handlePrintInvoice(invoice, "A4")}
                                data-testid={`button-print-a4-${invoice.id}`}
                              >
                                <Printer className="h-4 w-4 mr-2" />
                                Print A4
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handlePrintInvoice(invoice, "58mm")}
                                data-testid={`button-print-58mm-${invoice.id}`}
                              >
                                <Printer className="h-4 w-4 mr-2" />
                                Print 58mm Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handlePrintInvoice(invoice, "80mm")}
                                data-testid={`button-print-80mm-${invoice.id}`}
                              >
                                <Printer className="h-4 w-4 mr-2" />
                                Print 80mm Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleExportInvoicePDF(invoice, "A4")}
                                data-testid={`button-export-pdf-${invoice.id}`}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Export PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => updateStatusMutation.mutate({ 
                                  id: invoice.id, 
                                  status: invoice.status === "paid" ? "saved" : "paid" 
                                })}
                                data-testid={`button-toggle-status-${invoice.id}`}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Mark as {invoice.status === "paid" ? "Unpaid" : "Paid"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem 
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-red-600 focus:text-red-600"
                                    data-testid={`button-delete-${invoice.id}`}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete invoice {invoice.invoiceNumber}? 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteInvoiceMutation.mutate(invoice.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}