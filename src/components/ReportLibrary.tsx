
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { FileText, Search, Calendar, Download, Eye, Edit } from "lucide-react";
import { ReportData } from "@/lib/pdf-utils";

interface ReportLibraryProps {
  reports: ReportData[];
  onSelectReport: (report: ReportData) => void;
  onEditReport: (report: ReportData) => void;
  onDownloadReport: (report: ReportData) => void;
}

export function ReportLibrary({ 
  reports, 
  onSelectReport, 
  onEditReport, 
  onDownloadReport 
}: ReportLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.property.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getReportStats = (report: ReportData) => {
    const itemCount = report.items.length;
    const imageCount = report.items.reduce((acc, item) => acc + item.images.length, 0);
    return { itemCount, imageCount };
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Report Library</h1>
          <p className="text-muted-foreground">Manage and access all your reports</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {reports.length} {reports.length === 1 ? 'Report' : 'Reports'}
        </Badge>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search reports by title, address, or property type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {searchTerm ? 'No reports found' : 'No reports yet'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Try adjusting your search criteria' : 'Create your first report to get started'}
            </p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const stats = getReportStats(report);
            return (
              <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 mb-1">
                        {report.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-1">
                        {report.property.address}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {report.property.type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Date */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(report.date)}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{stats.itemCount} items</span>
                      <span>{stats.imageCount} images</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{selectedReport?.title}</DialogTitle>
                          </DialogHeader>
                          {selectedReport && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Property Details</h4>
                                <p className="text-sm text-muted-foreground">
                                  {selectedReport.property.address}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Type: {selectedReport.property.type}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Items ({selectedReport.items.length})</h4>
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                  {selectedReport.items.map((item, index) => (
                                    <div key={item.id} className="text-sm p-2 bg-muted rounded">
                                      {index + 1}. {item.description} - {item.condition}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onEditReport(report)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onDownloadReport(report)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
