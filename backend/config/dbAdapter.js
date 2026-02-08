/**
 * Database Adapter - Unified interface for SQLite and Supabase
 * Automatically switches between databases based on configuration
 */

const { supabase, isSupabaseConfigured } = require('./supabase');
const sqliteDb = require('./database');

/**
 * Execute a database query
 * Automatically routes to SQLite or Supabase based on configuration
 * 
 * @param {string} text - SQL query (SQLite syntax)
 * @param {array} params - Query parameters
 * @returns {Promise<{rows: array, rowCount: number, lastID: string}>}
 */
const query = async (text, params = []) => {
  if (isSupabaseConfigured) {
    return await executeSupabaseQuery(text, params);
  } else {
    return await sqliteDb.query(text, params);
  }
};

/**
 * Convert SQLite query to Supabase query
 * This is a simplified converter - complex queries may need manual conversion
 */
const executeSupabaseQuery = async (sqliteQuery, params = []) => {
  try {
    const query = sqliteQuery.trim().toLowerCase();
    
    // Extract table name from query
    const tableName = extractTableName(sqliteQuery);
    
    if (!tableName) {
      throw new Error('Could not extract table name from query');
    }

    // SELECT queries
    if (query.startsWith('select')) {
      return await handleSelect(sqliteQuery, params, tableName);
    }
    
    // INSERT queries
    if (query.startsWith('insert')) {
      return await handleInsert(sqliteQuery, params, tableName);
    }
    
    // UPDATE queries
    if (query.startsWith('update')) {
      return await handleUpdate(sqliteQuery, params, tableName);
    }
    
    // DELETE queries
    if (query.startsWith('delete')) {
      return await handleDelete(sqliteQuery, params, tableName);
    }
    
    throw new Error('Unsupported query type');
  } catch (error) {
    console.error('❌ Supabase query error:', error);
    throw error;
  }
};

/**
 * Extract table name from SQL query
 */
const extractTableName = (query) => {
  const lowerQuery = query.toLowerCase();
  
  // INSERT INTO table_name
  let match = lowerQuery.match(/insert\s+into\s+(\w+)/);
  if (match) return match[1];
  
  // UPDATE table_name
  match = lowerQuery.match(/update\s+(\w+)/);
  if (match) return match[1];
  
  // DELETE FROM table_name
  match = lowerQuery.match(/delete\s+from\s+(\w+)/);
  if (match) return match[1];
  
  // SELECT ... FROM table_name
  match = lowerQuery.match(/from\s+(\w+)/);
  if (match) return match[1];
  
  return null;
};

/**
 * Handle SELECT queries
 */
const handleSelect = async (sqliteQuery, params, tableName) => {
  // For complex queries with JOINs, use RPC or raw SQL
  if (sqliteQuery.toLowerCase().includes('join')) {
    // Use Supabase RPC for complex queries
    console.log('⚠️  Complex JOIN query detected. Consider using Supabase RPC function.');
    // For now, execute as-is (Supabase supports raw SQL via RPC)
    const { data, error } = await supabase.rpc('execute_sql', { 
      query: sqliteQuery, 
      params 
    });
    
    if (error) throw error;
    return { rows: data || [], rowCount: data?.length || 0 };
  }
  
  // Simple SELECT query
  let queryBuilder = supabase.from(tableName).select('*');
  
  // Add WHERE conditions (simplified - handles basic cases)
  const whereMatch = sqliteQuery.match(/where\s+(.+?)(?:order|limit|$)/i);
  if (whereMatch) {
    const conditions = whereMatch[1].trim();
    queryBuilder = applyWhereConditions(queryBuilder, conditions, params);
  }
  
  // Add ORDER BY
  const orderMatch = sqliteQuery.match(/order\s+by\s+(\w+)(?:\s+(asc|desc))?/i);
  if (orderMatch) {
    const column = orderMatch[1];
    const direction = orderMatch[2] || 'asc';
    queryBuilder = queryBuilder.order(column, { ascending: direction === 'asc' });
  }
  
  // Add LIMIT
  const limitMatch = sqliteQuery.match(/limit\s+(\d+)/i);
  if (limitMatch) {
    queryBuilder = queryBuilder.limit(parseInt(limitMatch[1]));
  }
  
  const { data, error } = await queryBuilder;
  
  if (error) throw error;
  
  console.log('📊 Supabase SELECT executed', { table: tableName, rows: data?.length || 0 });
  return { rows: data || [], rowCount: data?.length || 0 };
};

/**
 * Handle INSERT queries
 */
const handleInsert = async (sqliteQuery, params, tableName) => {
  // Extract column names and values
  const columnsMatch = sqliteQuery.match(/\(([^)]+)\)/);
  if (!columnsMatch) throw new Error('Could not parse INSERT columns');
  
  const columns = columnsMatch[1].split(',').map(c => c.trim());
  
  // Build insert object
  const insertData = {};
  columns.forEach((col, index) => {
    insertData[col] = params[index];
  });
  
  const { data, error } = await supabase
    .from(tableName)
    .insert(insertData)
    .select();
  
  if (error) throw error;
  
  console.log('📊 Supabase INSERT executed', { table: tableName, id: data?.[0]?.id });
  return { 
    rows: data || [], 
    rowCount: 1, 
    lastID: data?.[0]?.id 
  };
};

/**
 * Handle UPDATE queries
 */
const handleUpdate = async (sqliteQuery, params, tableName) => {
  // Extract SET clause
  const setMatch = sqliteQuery.match(/set\s+(.+?)\s+where/i);
  if (!setMatch) throw new Error('Could not parse UPDATE SET clause');
  
  const setClause = setMatch[1];
  const updates = {};
  
  // Parse SET assignments (simplified)
  const assignments = setClause.split(',');
  let paramIndex = 0;
  
  assignments.forEach(assignment => {
    const [column] = assignment.split('=').map(s => s.trim());
    if (column && column !== 'updated_at') {
      updates[column] = params[paramIndex++];
    }
  });
  
  // Extract WHERE clause
  const whereMatch = sqliteQuery.match(/where\s+(.+)$/i);
  if (!whereMatch) throw new Error('UPDATE requires WHERE clause');
  
  let queryBuilder = supabase.from(tableName).update(updates);
  queryBuilder = applyWhereConditions(queryBuilder, whereMatch[1], params.slice(paramIndex));
  
  const { data, error } = await queryBuilder.select();
  
  if (error) throw error;
  
  console.log('📊 Supabase UPDATE executed', { table: tableName, rows: data?.length || 0 });
  return { rows: data || [], rowCount: data?.length || 0 };
};

/**
 * Handle DELETE queries
 */
const handleDelete = async (sqliteQuery, params, tableName) => {
  const whereMatch = sqliteQuery.match(/where\s+(.+)$/i);
  if (!whereMatch) throw new Error('DELETE requires WHERE clause');
  
  let queryBuilder = supabase.from(tableName).delete();
  queryBuilder = applyWhereConditions(queryBuilder, whereMatch[1], params);
  
  const { data, error } = await queryBuilder.select();
  
  if (error) throw error;
  
  console.log('📊 Supabase DELETE executed', { table: tableName, rows: data?.length || 0 });
  return { rows: data || [], rowCount: data?.length || 0 };
};

/**
 * Apply WHERE conditions to query builder
 * Simplified version - handles basic equality checks
 */
const applyWhereConditions = (queryBuilder, conditions, params) => {
  let paramIndex = 0;
  
  // Handle simple equality: column = ?
  const eqMatch = conditions.match(/(\w+)\s*=\s*\?/);
  if (eqMatch && params[paramIndex] !== undefined) {
    queryBuilder = queryBuilder.eq(eqMatch[1], params[paramIndex++]);
  }
  
  // Handle AND conditions (simplified)
  const andParts = conditions.split(/\s+and\s+/i);
  andParts.forEach(part => {
    const match = part.match(/(\w+)\s*=\s*\?/);
    if (match && params[paramIndex] !== undefined) {
      queryBuilder = queryBuilder.eq(match[1], params[paramIndex++]);
    }
  });
  
  return queryBuilder;
};

/**
 * Get database client (for compatibility)
 */
const getClient = async () => {
  if (isSupabaseConfigured) {
    return supabase;
  } else {
    return sqliteDb.getClient();
  }
};

/**
 * Direct Supabase access for complex queries
 * Use this when the automatic converter doesn't work
 */
const getSupabase = () => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }
  return supabase;
};

module.exports = {
  query,
  getClient,
  getSupabase,
  isSupabaseConfigured,
};
