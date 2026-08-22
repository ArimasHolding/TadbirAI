import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data.json');

// In-memory data store for Fatourati API routes
const g = global as any;

export interface Company {
  id: string;
  name: string;
  email: string;
}

export interface Client {
  id: string;
  company?: string;
  customer_code: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  metadata?: Record<string, any>;
}

export interface Supplier {
  id: string;
  company?: string;
  supplier_code: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  metadata?: Record<string, any>;
}

export interface Product {
  id: string;
  company?: string;
  sku: string;
  name: string;
  description?: string;
  selling_price: number;
  quantity: number;
  unit?: string;
  category_name?: string;
  track_inventory?: boolean;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface InvoiceItem {
  id: string;
  invoice?: string;
  product?: string;
  quantity: number;
  unit_price?: number;
  discount?: number;
  tax_rate?: number;
  metadata?: Record<string, any>;
}

export interface Quotation {
  id: string;
  company?: string;
  client?: string;
  client_name?: string;
  quotation_number: string;
  date: string;
  valid_until?: string;
  total_amount: string | number;
  status: string;
  statut?: string;
  lignes?: any[];
  metadata?: Record<string, any>;
}

export interface Invoice {
  id: string;
  company?: string;
  client?: string;
  invoice_number: string;
  client_name?: string;
  status: string;
  total_amount: number;
  date?: string;
  phone?: string;
}

export interface Employee {
  id: string;
  prenom: string;
  nom: string;
  cin: string;
  cnss?: string;
  poste?: string;
  departement?: string;
  salaire_base: number;
  statut: string;
}

g.companiesStore = g.companiesStore || [];
const companiesStore: Company[] = g.companiesStore;

g.clientsStore = g.clientsStore || [];
let clientsStore: Client[] = g.clientsStore;

g.suppliersStore = g.suppliersStore || [];
let suppliersStore: Supplier[] = g.suppliersStore;

g.productsStore = g.productsStore || [];
let productsStore: Product[] = g.productsStore;

g.quotationsStore = g.quotationsStore || [];
let quotationsStore: Quotation[] = g.quotationsStore;

g.invoicesStore = g.invoicesStore || [];
let invoicesStore: Invoice[] = g.invoicesStore;

let idCounter = 1;
const generateUniqueId = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}-${Math.random().toString(36).substring(2, 6)}`;

const syncRef = (target: any[], source: any[]) => {
  if (target) {
    target.length = 0;
    target.push(...source);
  }
};

export const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      syncRef(g.companiesStore, data.companiesStore || []);
      syncRef(g.clientsStore, data.clientsStore || []);
      syncRef(g.suppliersStore, data.suppliersStore || []);
      syncRef(g.productsStore, data.productsStore || []);
      syncRef(g.quotationsStore, data.quotationsStore || []);
      syncRef(g.invoicesStore, data.invoicesStore || []);
      syncRef(g.employeesStore, data.employeesStore || []);
      syncRef(g.avoirsStore, data.avoirsStore || []);
      syncRef(g.depensesStore, data.depensesStore || []);
      syncRef(g.bulletinsStore, data.bulletinsStore || []);
      syncRef(g.bonsCommandeStore, data.bonsCommandeStore || []);
      syncRef(g.equipeStore, data.equipeStore || []);
    }
  } catch (err) {
    console.error("Error loading data.json", err);
  }
};

export const saveData = () => {
  try {
    const data = {
      companiesStore: g.companiesStore || [],
      clientsStore: g.clientsStore || [],
      suppliersStore: g.suppliersStore || [],
      productsStore: g.productsStore || [],
      quotationsStore: g.quotationsStore || [],
      invoicesStore: g.invoicesStore || [],
      employeesStore: g.employeesStore || [],
      avoirsStore: g.avoirsStore || [],
      depensesStore: g.depensesStore || [],
      bulletinsStore: g.bulletinsStore || [],
      bonsCommandeStore: g.bonsCommandeStore || [],
      equipeStore: g.equipeStore || [],
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing data.json", err);
  }
};

loadData();

export const getCompanies = () => { loadData(); return companiesStore; };
export const addCompany = (c: Partial<Company>): Company => {
  loadData();
  const newComp: Company = {
    id: generateUniqueId("comp"),
    name: c.name || "Fawatir Enterprise",
    email: c.email || "contact@fawatir.ma"
  };
  companiesStore.push(newComp); saveData();
  return newComp;
};

export const getClients = () => { loadData(); return clientsStore; };
export const getClientById = (id: string) => { loadData(); return clientsStore.find(c => c.id === id); };
export const addClient = (cli: Partial<Client>): Client => {
  loadData();
  const newCli: Client = {
    id: generateUniqueId("cli"),
    customer_code: cli.customer_code || `CL-${Math.floor(1000 + Math.random() * 9000)}`,
    company_name: cli.company_name || "Client Sans Nom",
    contact_name: cli.contact_name || "",
    email: cli.email || "",
    phone: cli.phone || "",
    city: cli.city || "",
    country: cli.country || "Maroc",
    metadata: cli.metadata || {}
  };
  clientsStore.push(newCli); saveData();
  return newCli;
};
export const updateClient = (id: string, patch: Partial<Client>) => {
  loadData();
  const cli = clientsStore.find(c => c.id === id);
  if (cli) Object.assign(cli, patch); saveData();
  return cli;
};
export const deleteClient = (id: string) => {
  loadData();
  const idx = clientsStore.findIndex(c => c.id === id);
  if (idx !== -1) clientsStore.splice(idx, 1); saveData();
};
export const clearClients = () => { clientsStore.length = 0; saveData(); };

export const getSuppliers = () => { loadData(); return suppliersStore; };
export const getSupplierById = (id: string) => { loadData(); return suppliersStore.find(s => s.id === id); };
export const addSupplier = (sup: Partial<Supplier>): Supplier => {
  loadData();
  const newSup: Supplier = {
    id: generateUniqueId("sup"),
    supplier_code: sup.supplier_code || `FR-${Math.floor(1000 + Math.random() * 9000)}`,
    company_name: sup.company_name || "Fournisseur Sans Nom",
    contact_name: sup.contact_name || "",
    email: sup.email || "",
    phone: sup.phone || "",
    city: sup.city || "",
    country: sup.country || "Maroc",
    metadata: sup.metadata || {}
  };
  suppliersStore.push(newSup); saveData();
  return newSup;
};
export const updateSupplier = (id: string, patch: Partial<Supplier>) => {
  loadData();
  const sup = suppliersStore.find(s => s.id === id);
  if (sup) { Object.assign(sup, patch); saveData(); }
  return sup;
};
export const deleteSupplier = (id: string) => {
  loadData();
  const idx = suppliersStore.findIndex(s => s.id === id);
  if (idx !== -1) suppliersStore.splice(idx, 1); saveData();
};
export const clearSuppliers = () => { suppliersStore.length = 0; saveData(); };

export const getProducts = () => { loadData(); return productsStore; };
export const getProductById = (id: string) => { loadData(); return productsStore.find(p => p.id === id); };
export const addProduct = (p: Partial<Product>): Product => {
  loadData();
  const newProd: Product = {
    id: generateUniqueId("prod"),
    sku: p.sku || `PRD-${Math.floor(100 + Math.random() * 900)}`,
    name: p.name || "Nouveau Produit",
    description: p.description || "",
    selling_price: Number(p.selling_price) || 0,
    quantity: p.quantity !== undefined ? Number(p.quantity) : 10,
    unit: p.unit || "unite",
    category_name: p.category_name || "General",
    track_inventory: p.track_inventory !== undefined ? p.track_inventory : true,
    is_active: p.is_active !== undefined ? p.is_active : true,
    metadata: p.metadata || {}
  };
  productsStore.push(newProd); saveData();
  return newProd;
};
export const updateProduct = (id: string, patch: Partial<Product>) => {
  const prod = productsStore.find(p => p.id === id);
  if (prod) Object.assign(prod, patch); saveData();
  return prod;
};
export const deleteProduct = (id: string) => {
  const idx = productsStore.findIndex(p => p.id === id);
  if (idx !== -1) productsStore.splice(idx, 1); saveData();
};
export const clearProducts = () => { productsStore.length = 0; saveData(); };

export const getQuotations = () => quotationsStore;
export const getQuotationById = (id: string) => quotationsStore.find(q => q.id === id);
export const addQuotation = (q: Partial<Quotation> & { lignes?: any[] }): Quotation => {
  const newQ: Quotation & { lignes?: any[] } = {
    id: generateUniqueId("dev"),
    quotation_number: q.quotation_number || `DEV-${Math.floor(1000 + Math.random() * 9000)}`,
    client_name: (q as any).client_name || "Client",
    status: q.status || "Brouillon",
    total_amount: String(Number(q.total_amount) || 0),
    date: q.date || new Date().toISOString().split("T")[0],
    lignes: q.lignes || []
  };
  quotationsStore.push(newQ); saveData();
  return newQ;
};
export const deleteQuotation = (id: string): boolean => {
  const idx = quotationsStore.findIndex(q => q.id === id);
  if (idx !== -1) {
    quotationsStore.splice(idx, 1); saveData();
    return true;
  }
  return false;
};
export const updateQuotation = (id: string, patch: Partial<Quotation>) => {
  const q = quotationsStore.find(q => q.id === id);
  if (q) Object.assign(q, patch); saveData();
  return q;
};
export const clearQuotations = () => { quotationsStore.length = 0; saveData(); };

export const getInvoices = () => invoicesStore;
export const getInvoiceById = (id: string) => invoicesStore.find(i => i.id === id);
export const addInvoice = (inv: Partial<Invoice> & { lignes?: any[] }): Invoice => {
  const newInv: Invoice & { lignes?: any[] } = {
    id: generateUniqueId("fac"),
    invoice_number: inv.invoice_number || `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
    client_name: inv.client_name || "Client",
    status: inv.status || "Brouillon",
    total_amount: Number(inv.total_amount) || 0,
    date: inv.date || new Date().toISOString().split("T")[0],
    lignes: inv.lignes || []
  };
  invoicesStore.push(newInv); saveData();
  return newInv;
};
export const updateInvoice = (id: string, patch: Partial<Invoice>) => {
  const inv = invoicesStore.find(i => i.id === id);
  if (inv) Object.assign(inv, patch); saveData();
  return inv;
};
export const deleteInvoice = (id: string) => {
  const idx = invoicesStore.findIndex(i => i.id === id);
  if (idx !== -1) invoicesStore.splice(idx, 1); saveData();
};
export const clearInvoices = () => { invoicesStore.length = 0; saveData(); };

// EMPLOYEES
g.employeesStore = g.employeesStore || [
  { id: "EMP-1001", prenom: "Karim", nom: "Benjelloun", cin: "BE892102", cnss: "109829384", poste: "Directeur Technique", departement: "Engineering", salaire_base: 18500, personnesACharge: 2, statut: "Actif" },
  { id: "EMP-1002", prenom: "Sophia", nom: "Tazi", cin: "A778901", cnss: "209182391", poste: "Responsable Financier", departement: "Finance", salaire_base: 15000, personnesACharge: 1, statut: "Actif" },
  { id: "EMP-1003", prenom: "Youssef", nom: "Berrada", cin: "C992102", cnss: "308291029", poste: "Ingénieur DevOps", departement: "Engineering", salaire_base: 12500, personnesACharge: 0, statut: "Actif" }
];
const employeesStore: Employee[] = g.employeesStore;

export const getEmployees = (): Employee[] => [...employeesStore].reverse();
export const addEmployee = (emp: Partial<Employee>): Employee => {
  const newEmp = { ...emp, id: `EMP-${Date.now().toString().slice(-6)}` } as Employee;
  employeesStore.push(newEmp); saveData();
  return newEmp;
};
export const updateEmployee = (id: string, patch: Partial<Employee>): Employee | null => {
  const emp = employeesStore.find(e => e.id === id);
  if (emp) { Object.assign(emp, patch); saveData(); return emp; }
  return null;
};
export const deleteEmployee = (id: string): boolean => {
  const idx = employeesStore.findIndex(e => e.id === id);
  if (idx !== -1) { employeesStore.splice(idx, 1); saveData(); return true; }
  return false;
};
export const clearEmployees = () => { employeesStore.length = 0; saveData(); };

// AVOIRS
g.avoirsStore = g.avoirsStore || [];
const avoirsStore: any[] = g.avoirsStore;
export const getAvoirs = () => [...avoirsStore].reverse();
export const addAvoir = (avoir: any) => { avoir.id = `AV-${Date.now()}`; avoirsStore.push(avoir); saveData(); return avoir; };
export const updateAvoir = (id: string, patch: any) => {
  const item = avoirsStore.find((a: any) => a.id === id);
  if (item) Object.assign(item, patch); saveData();
  return item;
};
export const deleteAvoir = (id: string) => {
  const idx = avoirsStore.findIndex((a: any) => a.id === id);
  if (idx !== -1) { avoirsStore.splice(idx, 1); saveData(); return true; }
  return false;
};

// DEPENSES
g.depensesStore = g.depensesStore || [];
const depensesStore: any[] = g.depensesStore;
export const getDepenses = () => [...depensesStore].reverse();
export const addDepense = (dep: any) => { dep.id = `DEP-${Date.now()}`; depensesStore.push(dep); saveData(); return dep; };
export const updateDepense = (id: string, patch: any) => {
  const item = depensesStore.find((d: any) => d.id === id);
  if (item) {
    if (patch.status && !patch.statut) patch.statut = patch.status;
    if (patch.statut && !patch.status) patch.status = patch.statut;
    Object.assign(item, patch);
    saveData();
  }
  return item;
};
export const deleteDepense = (id: string) => {
  const idx = depensesStore.findIndex((d: any) => d.id === id);
  if (idx !== -1) { depensesStore.splice(idx, 1); saveData(); return true; }
  return false;
};
export const clearDepenses = () => { depensesStore.length = 0; saveData(); };

// BULLETINS DE PAIE
g.bulletinsStore = g.bulletinsStore || [
  { id: "BUL-1001", employeId: "EMP-1001", periode: "Avril 2026", dateEmission: "2026-04-28", statut: "Payé" },
  { id: "BUL-1002", employeId: "EMP-1002", periode: "Avril 2026", dateEmission: "2026-04-28", statut: "Payé" },
  { id: "BUL-1003", employeId: "EMP-1003", periode: "Avril 2026", dateEmission: "2026-04-28", statut: "Brouillon" }
];
const bulletinsStore: any[] = g.bulletinsStore;
export const getBulletins = () => [...bulletinsStore].reverse();
export const addBulletin = (bul: any) => { bul.id = `BUL-${Date.now()}`; bulletinsStore.push(bul); saveData(); return bul; };

// BONS DE COMMANDE
g.bonsCommandeStore = g.bonsCommandeStore || [];
const bonsCommandeStore: any[] = g.bonsCommandeStore;
export const getBonsCommande = () => [...bonsCommandeStore].reverse();
export const getBonCommandeById = (id: string) => bonsCommandeStore.find((bc: any) => bc.id === id);
export const addBonCommande = (bc: any) => { 
  bc.id = bc.id || `BC-${Date.now()}`; 
  bc.statut = bc.statut || bc.status || "Brouillon";
  bonsCommandeStore.push(bc); saveData(); 
  return bc; 
};
export const updateBonCommande = (id: string, patch: any) => {
  const item = bonsCommandeStore.find((bc: any) => bc.id === id);
  if (item) {
    if (patch.status && !patch.statut) patch.statut = patch.status;
    if (patch.statut && !patch.status) patch.status = patch.statut;
    Object.assign(item, patch); 
    saveData();
  }
  return item;
};
export const deleteBonCommande = (id: string) => {
  const idx = bonsCommandeStore.findIndex((bc: any) => bc.id === id);
  if (idx !== -1) { bonsCommandeStore.splice(idx, 1); saveData(); return true; }
  return false;
};
export const clearBonsCommande = () => { bonsCommandeStore.length = 0; saveData(); };

// EQUIPE
g.equipeStore = g.equipeStore || [
  { id: "EQ-1001", nom: "Amine El Mansouri", email: "a.mansouri@entreprise.ma", role: "Administrateur", statut: "Actif" },
  { id: "EQ-1002", nom: "Sarah Alami", email: "s.alami@entreprise.ma", role: "Comptable", statut: "Actif" },
  { id: "EQ-1003", nom: "Youssef Bennani", email: "y.bennani@entreprise.ma", role: "Commercial", statut: "Invité" }
];
const equipeStore: any[] = g.equipeStore;
export const getEquipe = () => [...equipeStore].reverse();
export const addEquipe = (eq: any) => { eq.id = `EQ-${Date.now()}`; equipeStore.push(eq); saveData(); return eq; };

