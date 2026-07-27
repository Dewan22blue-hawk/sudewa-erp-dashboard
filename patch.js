const fs = require('fs');
const file = 'src/services/withholding-tax.service.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /body\.append\('withholding_age', String\(payload\.withholding_age\)\);/g,
  "if (payload.withholding_age != null) body.append('withholding_age', String(payload.withholding_age));"
);
code = code.replace(
  /body\.append\('pph_amount', String\(payload\.pph_amount\)\);/g,
  "if (payload.pph_amount != null) body.append('pph_amount', String(payload.pph_amount));"
);

// always append cash_id
code = code.replace(
  /if \(payload\.cash_id != null\) \{\n    body\.append\('cash_id', String\(payload\.cash_id\)\);\n  \}/g,
  "if (payload.cash_id != null) {\n    body.append('cash_id', String(payload.cash_id));\n  } else {\n    body.append('cash_id', '');\n  }"
);

fs.writeFileSync(file, code);
