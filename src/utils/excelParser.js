import * as XLSX from 'xlsx';

/**
 * Parse an Excel file and return the data as JSON
 * @param {File} file - The Excel file to parse
 * @returns {Promise<{headers: string[], data: Object[]}>}
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Get headers directly from the first row of the sheet
        // This ensures we get ALL columns, even if they're empty in some rows
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        const headers = [];
        const headerRow = range.s.r; // First row (usually 0)
        
        if (range.e.c >= 0) {
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col });
            const cell = worksheet[cellAddress];
            let headerName = '';
            
            if (cell && cell.v !== undefined && cell.v !== null) {
              headerName = String(cell.v).trim();
            }
            
            // If header is empty, use default column name (A, B, C, etc.)
            if (!headerName) {
              headerName = XLSX.utils.encode_col(col);
            }
            
            headers.push(headerName);
          }
        }
        
        // Convert to JSON - use header: 1 to get arrays (header row is automatically skipped)
        const rawData = XLSX.utils.sheet_to_json(worksheet, { 
          defval: '',
          header: 1 // Get arrays instead of objects
        });
        
        // Skip the header row and convert arrays to objects using our headers
        const jsonData = [];
        if (rawData.length > 1) {
          // Skip first row (index 0) as it's the header row
          for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i] || [];
            const rowObj = {};
            headers.forEach((header, index) => {
              rowObj[header] = row[index] !== undefined && row[index] !== null ? row[index] : '';
            });
            jsonData.push(rowObj);
          }
        }
        
        resolve({
          headers,
          data: jsonData
        });
      } catch (error) {
        reject(new Error('Failed to parse Excel file: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Build org chart data structure from parsed Excel data
 * @param {Object[]} data - The parsed Excel data
 * @param {string} positionColumn - Column name for positions
 * @param {string} managerColumn - Column name for managers
 * @param {string[]} displayColumns - Columns to display on the chart
 * @returns {Object} - Root node of the org chart
 */
export function buildOrgChart(data, positionColumn, managerColumn, displayColumns = []) {
  if (!data || data.length === 0) {
    return null;
  }

  // Create a map of position -> node data
  const nodeMap = new Map();
  const rootNodes = [];

  // First pass: create all nodes
  data.forEach((row) => {
    const position = String(row[positionColumn] || '').trim();
    const manager = String(row[managerColumn] || '').trim();
    
    if (!position) return;

    const nodeData = {
      id: position,
      position: position,
      manager: manager,
      children: [],
      data: {}
    };

    // Add display column data
    displayColumns.forEach(col => {
      if (row[col] !== undefined && row[col] !== '') {
        nodeData.data[col] = row[col];
      }
    });

    nodeMap.set(position, nodeData);
  });

  // Second pass: build hierarchy
  nodeMap.forEach((node) => {
    if (!node.manager || node.manager === '' || node.manager === node.position) {
      // Root node (no manager or self-referencing)
      rootNodes.push(node);
    } else {
      const managerNode = nodeMap.get(node.manager);
      if (managerNode) {
        managerNode.children.push(node);
      } else {
        // Manager not found, treat as root
        rootNodes.push(node);
      }
    }
  });

  // If we have multiple root nodes, create a virtual root
  if (rootNodes.length === 0) {
    return null;
  } else if (rootNodes.length === 1) {
    return rootNodes[0];
  } else {
    // Multiple roots - create a virtual root node
    return {
      id: 'root',
      position: 'Organization',
      manager: '',
      children: rootNodes,
      data: {}
    };
  }
}

