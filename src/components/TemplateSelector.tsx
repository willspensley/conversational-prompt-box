
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { Search, Plus, FileText, Trash2 } from "lucide-react";
import { ReportTemplate, TemplateService } from "@/lib/report-templates";
import { useToast } from "@/hooks/use-toast";

interface TemplateSelectorProps {
  onSelectTemplate: (template: ReportTemplate) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function TemplateSelector({ onSelectTemplate, onClose, isOpen }: TemplateSelectorProps) {
  const [templates] = useState<ReportTemplate[]>(TemplateService.getTemplates());
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const category = template.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, ReportTemplate[]>);

  const handleSelectTemplate = (template: ReportTemplate) => {
    onSelectTemplate(template);
    onClose();
    toast({
      title: "Template Selected",
      description: `Using "${template.name}" template to create your report.`
    });
  };

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    TemplateService.deleteTemplate(templateId);
    toast({
      title: "Template Deleted",
      description: `"${templateName}" template has been removed.`
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose a Report Template</DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                {category}
                <Badge variant="secondary" className="text-xs">
                  {categoryTemplates.length}
                </Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{template.icon}</span>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                        {template.isCustom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id, template.name);
                            }}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Includes:</span>
                          <span className="ml-2">{template.fields.defaultItems.length} default items</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {template.fields.propertyType}
                          </Badge>
                          {template.isCustom && (
                            <Badge variant="secondary" className="text-xs">
                              Custom
                            </Badge>
                          )}
                        </div>

                        <Button 
                          onClick={() => handleSelectTemplate(template)}
                          className="w-full"
                          size="sm"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Start from Scratch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
