/**
 * Get unique employment types from the data
 * @param {Object[]} excelData - The parsed Excel data
 * @param {string} employmentTypeColumn - Column name that contains employment type
 * @returns {string[]} - Array of unique employment type values
 */
export function getUniqueEmploymentTypes(excelData, employmentTypeColumn) {
  if (!excelData || !employmentTypeColumn || excelData.length === 0) {
    return [];
  }

  const types = new Set();
  excelData.forEach(row => {
    const type = String(row[employmentTypeColumn] || '').trim();
    if (type) {
      types.add(type);
    }
  });

  return Array.from(types).sort();
}

/**
 * Get columns specific to a particular employment type
 * These are fields that should only display for this employment type
 * @param {Object} fieldGroups - The field groups object { employmentType: [columnNames] }
 * @param {string} employmentType - The employment type value
 * @returns {string[]} - Array of column names specific to this employment type
 */
export function getColumnsForEmploymentType(fieldGroups, employmentType) {
  if (!employmentType || !fieldGroups) {
    return [];
  }

  const type = String(employmentType).trim();
  // Returns the columns that are specific to this employment type
  // Empty array means no specific fields selected, so all fields will be shown
  return fieldGroups[type] || [];
}
