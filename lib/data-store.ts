import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_FILE = path.join(process.cwd(), 'data.json');

// In-memory data store for Tadbir AI Enterprise API routes
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
  sub_category?: string;
  min_stock?: number;
  track_inventory?: boolean;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  unit?: string;
  source: string;
  supplier?: string;
  date: string;
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

g.stockMovementsStore = g.stockMovementsStore || [];
let stockMovementsStore: StockMovement[] = g.stockMovementsStore;

g.employeesStore = g.employeesStore || [];
const employeesStore: Employee[] = g.employeesStore;

g.avoirsStore = g.avoirsStore || [];
const avoirsStore: any[] = g.avoirsStore;

g.depensesStore = g.depensesStore || [];
const depensesStore: any[] = g.depensesStore;

g.bulletinsStore = g.bulletinsStore || [];
const bulletinsStore: any[] = g.bulletinsStore;

g.bonsCommandeStore = g.bonsCommandeStore || [];
const bonsCommandeStore: any[] = g.bonsCommandeStore;

g.equipeStore = g.equipeStore || [
  { id: "EQ-1001", nom: "Meryem El Osmani", email: "maryamelosmani@gmail.com", role: "Administrateur", statut: "Actif" },
  { id: "EQ-1788704753859", nom: "Nissrine BESTOUT", email: "m.elosmani@edu.ma.ac.ma", role: "Comptable", statut: "Invité" },
  { id: "EQ-1788704857472", nom: "Nissrine BESTOUT", email: "m.elosmani@edu.umi.ac.ma", role: "Comptable", statut: "Actif" },
  { id: "EQ-1788705900000", nom: "ASMAA BERDIGH", email: "aberdigh@gmail.com", role: "Administrateur", statut: "Invité" }
];
const equipeStore: any[] = g.equipeStore;

g.usersStore = g.usersStore || [
  { id: "USR-1001", email: "maryamelosmani@gmail.com", nom: "Meryem El Osmani", role: "Administrateur", company: "Tadbir AI Enterprise", emailVerified: true },
  { id: "USR-1788704942449", email: "m.elosmani@edu.umi.ac.ma", nom: "NISSRINE BESTOUT", role: "Comptable", company: "Tadbir AI Enterprise", emailVerified: true }
];
const usersStore: any[] = g.usersStore;

let idCounter = 1;
const generateUniqueId = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}-${Math.random().toString(36).substring(2, 6)}`;

const syncRef = (target: any[], source: any[]) => {
  if (target && Array.isArray(source)) {
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
      syncRef(g.stockMovementsStore, data.stockMovementsStore || []);
      syncRef(g.usersStore, data.usersStore || []);
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
      stockMovementsStore: g.stockMovementsStore || [],
      usersStore: g.usersStore || [],
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
    name: c.name || "Tadbir AI Enterprise",
    email: c.email || "contact@tadbir.ai"
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

const parseNumHelper = (val: any, defaultVal = 0): number => {
  if (val === undefined || val === null || val === "") return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  const str = String(val).replace(/[^\d.,-]/g, '').replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? defaultVal : num;
};

export const addProduct = (p: Partial<Product> & Record<string, any>): Product => {
  loadData();
  const rawPrice = p.selling_price !== undefined ? p.selling_price : p.prix !== undefined ? p.prix : p.price;
  const rawQty = p.quantity !== undefined ? p.quantity : p.stock !== undefined ? p.stock : p.qty !== undefined ? p.qty : p.quantite;
  const rawMinStock = p.min_stock !== undefined ? p.min_stock : p.minimum_stock !== undefined ? p.minimum_stock : p.seuil_alerte !== undefined ? p.seuil_alerte : (p.seuil !== undefined ? p.seuil : 5);
  const rawSubCat = p.sub_category || p.sous_categorie || p.subCategory || p.sous_famille || "";

  const newProd: Product = {
    id: generateUniqueId("prod"),
    sku: p.sku || p.ref || p.code || `PRD-${Math.floor(100 + Math.random() * 900)}`,
    name: p.name || p.nom || p.title || p.designation || "Nouveau Produit",
    description: p.description || "",
    selling_price: parseNumHelper(rawPrice, 0),
    quantity: parseNumHelper(rawQty, 0),
    unit: p.unit || p.unite || "unite",
    category_name: p.category_name || p.categorie || p.famille || "General",
    sub_category: String(rawSubCat),
    min_stock: parseNumHelper(rawMinStock, 5),
    track_inventory: p.track_inventory !== undefined ? Boolean(p.track_inventory) : true,
    is_active: p.is_active !== undefined ? Boolean(p.is_active) : true,
    metadata: p.metadata || {}
  };
  productsStore.push(newProd); saveData();
  return newProd;
};
export const updateProduct = (id: string, patch: Partial<Product> & Record<string, any>) => {
  loadData();
  const prod = productsStore.find(p => p.id === id);
  if (prod) {
    if (patch.name !== undefined) prod.name = patch.name;
    if (patch.nom !== undefined) prod.name = patch.nom;
    if (patch.sku !== undefined) prod.sku = patch.sku;
    if (patch.description !== undefined) prod.description = patch.description;
    
    const rawPrice = patch.selling_price !== undefined ? patch.selling_price : patch.prix !== undefined ? patch.prix : patch.price;
    if (rawPrice !== undefined) prod.selling_price = parseNumHelper(rawPrice, 0);

    const rawQty = patch.quantity !== undefined ? patch.quantity : patch.stock !== undefined ? patch.stock : patch.qty !== undefined ? patch.qty : patch.quantite;
    if (rawQty !== undefined) prod.quantity = parseNumHelper(rawQty, 0);

    const rawMinStock = patch.min_stock !== undefined ? patch.min_stock : patch.minimum_stock !== undefined ? patch.minimum_stock : patch.seuil_alerte !== undefined ? patch.seuil_alerte : patch.seuil;
    if (rawMinStock !== undefined) prod.min_stock = parseNumHelper(rawMinStock, 5);

    const rawSubCat = patch.sub_category !== undefined ? patch.sub_category : patch.sous_categorie !== undefined ? patch.sous_categorie : patch.subCategory;
    if (rawSubCat !== undefined) prod.sub_category = String(rawSubCat);

    if (patch.unit !== undefined) prod.unit = patch.unit;
    if (patch.unite !== undefined) prod.unit = patch.unite;
    if (patch.category_name !== undefined) prod.category_name = patch.category_name;
    if (patch.categorie !== undefined) prod.category_name = patch.categorie;
    if (patch.track_inventory !== undefined) prod.track_inventory = Boolean(patch.track_inventory);
    if (patch.is_active !== undefined) prod.is_active = Boolean(patch.is_active);
    if (patch.metadata !== undefined) prod.metadata = patch.metadata;

    saveData();
  }
  return prod;
};
export const deleteProduct = (id: string) => {
  loadData();
  const idx = productsStore.findIndex(p => p.id === id);
  if (idx !== -1) productsStore.splice(idx, 1); saveData();
};
export const bulkDeleteProducts = (ids: string[]) => {
  loadData();
  if (!Array.isArray(ids) || ids.length === 0) return 0;
  const initialLength = productsStore.length;
  const idSet = new Set(ids);
  const filtered = productsStore.filter(p => !idSet.has(p.id));
  productsStore.length = 0;
  productsStore.push(...filtered);
  saveData();
  return initialLength - productsStore.length;
};
export const clearProducts = () => { productsStore.length = 0; saveData(); };

export const getStockMovements = () => { loadData(); return stockMovementsStore; };

export const adjustProductStock = (
  productIdOrName: string, 
  quantityChange: number, 
  source: string,
  supplier?: string
): { product: Product; movement: StockMovement } | null => {
  loadData();
  const searchKey = (productIdOrName || "").trim().toLowerCase();
  const prod = productsStore.find(p => 
    p.id === productIdOrName || 
    p.sku.toLowerCase() === searchKey || 
    p.name.toLowerCase() === searchKey ||
    searchKey.includes(p.name.toLowerCase()) ||
    p.name.toLowerCase().includes(searchKey)
  );
  if (!prod) return null;
  
  const prevQty = Number(prod.quantity) || 0;
  const newQty = Math.max(0, prevQty + quantityChange);
  prod.quantity = newQty;
  
  const movement: StockMovement = {
    id: generateUniqueId("sm"),
    product_id: prod.id,
    product_name: prod.name,
    type: quantityChange >= 0 ? "IN" : "OUT",
    quantity: Math.abs(quantityChange),
    previous_quantity: prevQty,
    new_quantity: newQty,
    unit: prod.unit || "unité",
    source: source || "Entrée de stock",
    supplier: supplier || "",
    date: new Date().toISOString()
  };
  
  g.stockMovementsStore = g.stockMovementsStore || [];
  g.stockMovementsStore.unshift(movement);
  saveData();
  return { product: prod, movement };
};

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
export const getBulletins = () => [...bulletinsStore].reverse();
export const addBulletin = (bul: any) => { bul.id = `BUL-${Date.now()}`; bulletinsStore.push(bul); saveData(); return bul; };

// BONS DE COMMANDE
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

// USERS STORE FOR AUTH & REGISTRATION
export const getUsers = () => [...usersStore];
export const findUserByEmail = (email: string) => {
  loadData();
  const target = (email || "").trim().toLowerCase();
  return usersStore.find((u: any) => u.email?.trim().toLowerCase() === target);
};
export const addUser = (u: any) => {
  loadData();
  
  // Hash password using SHA-256 if provided
  let hashedPassword = undefined;
  if (u.password) {
    hashedPassword = crypto.createHash('sha256').update(u.password).digest('hex');
  }

  const newUser = {
    id: u.id || `USR-${Date.now()}`,
    email: u.email,
    password: hashedPassword,
    nom: u.nom,
    role: u.role || "Lecteur",
    company: u.company || "Tadbir AI Enterprise",
    emailVerified: true
  };
  usersStore.push(newUser);
  saveData();
  return newUser;
};

// EQUIPE
export const getEquipe = () => { loadData(); return [...equipeStore].reverse(); };
export const addEquipe = (eq: any) => { 
  loadData();
  eq.id = eq.id || `EQ-${Date.now()}`; 
  equipeStore.push(eq); 
  saveData(); 
  return eq; 
};
export const updateEquipe = (id: string, patch: any) => {
  loadData();
  const item = equipeStore.find((m: any) => m.id === id);
  if (item) {
    Object.assign(item, patch);
    saveData();
  }
  return item;
};
export const deleteEquipe = (idOrEmail: string) => {
  loadData();
  const target = (idOrEmail || "").trim().toLowerCase();
  const idx = equipeStore.findIndex((m: any) => 
    m.id === idOrEmail || (m.email && m.email.trim().toLowerCase() === target)
  );
  if (idx !== -1) {
    const deletedEmail = equipeStore[idx]?.email;
    equipeStore.splice(idx, 1);
    if (deletedEmail) {
      const uIdx = usersStore.findIndex((u: any) => u.email?.trim().toLowerCase() === deletedEmail.trim().toLowerCase());
      if (uIdx !== -1) usersStore.splice(uIdx, 1);
    }
    saveData();
    return true;
  }
  return false;
};
export const bulkDeleteEquipe = (idsOrEmails: string[]) => {
  loadData();
  const idSet = new Set(idsOrEmails);
  const emailSet = new Set(idsOrEmails.map((s) => s.toLowerCase()));

  const remainingEquipe = equipeStore.filter((m: any) => 
    !idSet.has(m.id) && !(m.email && emailSet.has(m.email.toLowerCase()))
  );
  equipeStore.length = 0;
  equipeStore.push(...remainingEquipe);

  const remainingUsers = usersStore.filter((u: any) => 
    !idSet.has(u.id) && !(u.email && emailSet.has(u.email.toLowerCase()))
  );
  usersStore.length = 0;
  usersStore.push(...remainingUsers);

  saveData();
  return true;
};
export const activateEquipeMember = (email: string) => {
  loadData();
  const target = (email || "").trim().toLowerCase();
  const item = equipeStore.find((m: any) => m.email?.trim().toLowerCase() === target);
  if (item) {
    item.statut = "Actif";
    saveData();
  }
  return item;
};

export const clearAllAuthenticatedUsers = () => {
  loadData();
  usersStore.length = 0;
  equipeStore.forEach((m: any) => {
    if (m.role !== "Administrateur") {
      m.statut = "Invité";
    }
  });
  saveData();
  return { success: true };
};
