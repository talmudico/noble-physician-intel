import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

function exportToCSV(data, columns, filename) {
  if (!data || data.length === 0) return;
  const headers = columns.map(c => c.label).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = typeof c.accessor === 'function' ? c.accessor(row) : row[c.key];
      const str = String(val ?? '');
      return str.includes(',') ? `"${str}"` : str;
    }).join(',')
  );
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DataTable({ columns, data, title, exportFilename, emptyMessage = "No data available" }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {(title || exportFilename) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
          {exportFilename && data && data.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
              onClick={() => exportToCSV(data, columns, exportFilename)}
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((col, i) => (
                <TableHead key={i} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!data || data.length === 0) ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-sm text-muted-foreground py-8">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow key={row.id || idx} className="hover:bg-muted/30 transition-colors">
                  {columns.map((col, i) => (
                    <TableCell key={i} className="text-sm whitespace-nowrap">
                      {col.render ? col.render(row) : (typeof col.accessor === 'function' ? col.accessor(row) : row[col.key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}