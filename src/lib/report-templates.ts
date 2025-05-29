
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  fields: {
    title: string;
    propertyType: string;
    defaultItems: Array<{
      description: string;
      condition: "Good" | "Fair" | "Poor";
      notes: string;
    }>;
  };
  createdAt: string;
  isCustom?: boolean;
}

export const defaultTemplates: ReportTemplate[] = [
  {
    id: "property-inspection",
    name: "Property Inspection",
    description: "Comprehensive property condition assessment for real estate",
    category: "Real Estate",
    icon: "🏠",
    fields: {
      title: "Property Inspection Report",
      propertyType: "Residential",
      defaultItems: [
        { description: "Roof Condition", condition: "Good", notes: "Inspect for leaks, missing tiles, or damage" },
        { description: "Electrical System", condition: "Good", notes: "Check outlets, breakers, and wiring" },
        { description: "Plumbing System", condition: "Good", notes: "Test water pressure and check for leaks" },
        { description: "HVAC System", condition: "Good", notes: "Inspect heating and cooling systems" },
        { description: "Foundation", condition: "Good", notes: "Check for cracks or settling issues" }
      ]
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "inventory-assessment",
    name: "Inventory Assessment", 
    description: "Business inventory evaluation and cataloging",
    category: "Business",
    icon: "📦",
    fields: {
      title: "Business Inventory Report",
      propertyType: "Commercial",
      defaultItems: [
        { description: "Office Equipment", condition: "Good", notes: "Computers, printers, and office furniture" },
        { description: "Machinery", condition: "Good", notes: "Industrial equipment and tools" },
        { description: "Inventory Stock", condition: "Good", notes: "Product inventory and supplies" },
        { description: "Safety Equipment", condition: "Good", notes: "Fire extinguishers, first aid, emergency exits" }
      ]
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "damage-assessment",
    name: "Damage Assessment",
    description: "Insurance claim documentation and damage evaluation",
    category: "Insurance",
    icon: "⚠️",
    fields: {
      title: "Damage Assessment Report",
      propertyType: "Residential",
      defaultItems: [
        { description: "Exterior Damage", condition: "Poor", notes: "Document visible exterior damage" },
        { description: "Interior Damage", condition: "Poor", notes: "Assess interior damage and affected areas" },
        { description: "Personal Property", condition: "Fair", notes: "Inventory damaged personal belongings" },
        { description: "Structural Issues", condition: "Poor", notes: "Note any structural damage or safety concerns" }
      ]
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "maintenance-checklist",
    name: "Maintenance Checklist",
    description: "Regular maintenance and service inspection",
    category: "Maintenance",
    icon: "🔧",
    fields: {
      title: "Maintenance Inspection Report",
      propertyType: "Commercial",
      defaultItems: [
        { description: "Fire Safety Systems", condition: "Good", notes: "Test alarms, sprinklers, and emergency lighting" },
        { description: "Security Systems", condition: "Good", notes: "Check cameras, locks, and access controls" },
        { description: "Building Systems", condition: "Good", notes: "HVAC, electrical, and plumbing maintenance" },
        { description: "Exterior Maintenance", condition: "Good", notes: "Landscaping, parking, and building exterior" }
      ]
    },
    createdAt: new Date().toISOString()
  }
];

export class TemplateService {
  private static STORAGE_KEY = 'report-templates';

  static getTemplates(): ReportTemplate[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const customTemplates = saved ? JSON.parse(saved) : [];
    return [...defaultTemplates, ...customTemplates];
  }

  static saveTemplate(template: ReportTemplate): void {
    const templates = this.getCustomTemplates();
    templates.push({ ...template, isCustom: true });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
  }

  static deleteTemplate(templateId: string): void {
    const templates = this.getCustomTemplates();
    const filtered = templates.filter(t => t.id !== templateId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  static getCustomTemplates(): ReportTemplate[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  static createTemplateFromReport(report: any, name: string, description: string): ReportTemplate {
    return {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      category: "Custom",
      icon: "📋",
      fields: {
        title: report.title,
        propertyType: report.property.type,
        defaultItems: report.items.map((item: any) => ({
          description: item.description,
          condition: item.condition,
          notes: item.notes
        }))
      },
      createdAt: new Date().toISOString(),
      isCustom: true
    };
  }
}
