import re

def main():
    with open('tsc-errors-final.txt', 'r') as f:
        output = f.read()
        
    lines = output.split('\n')
    for line in lines:
        filepath = None
        line_num = None
        old = None
        new = None
        
        # 'perPage' does not exist ... Did you mean to write 'per_page'?
        m1 = re.match(r"^(.+\.ts[x]?)\((\d+),\d+\): error TS[0-9]+: .*but 'perPage' does not exist .*Did you mean to write 'per_page'", line)
        if m1:
            filepath, line_num = m1.group(1), int(m1.group(2))
            old, new = 'perPage', 'per_page'
            
        m2 = re.match(r"^(.+\.ts[x]?)\((\d+),\d+\): error TS[0-9]+: Property 'perPage' does not exist.*Did you mean 'per_page'\?", line)
        if m2:
            filepath, line_num = m2.group(1), int(m2.group(2))
            old, new = 'perPage', 'per_page'

        m3 = re.match(r"^(.+\.ts[x]?)\((\d+),\d+\): error TS[0-9]+: Property 'per_page' does not exist.*Did you mean 'perPage'\?", line)
        if m3:
            filepath, line_num = m3.group(1), int(m3.group(2))
            old, new = 'per_page', 'perPage'

        m4 = re.match(r"^(.+\.ts[x]?)\((\d+),\d+\): error TS[0-9]+: Object literal may only specify known properties, but 'per_page' does not exist.*Did you mean to write 'perPage'", line)
        if m4:
            filepath, line_num = m4.group(1), int(m4.group(2))
            old, new = 'per_page', 'perPage'
            
        m5 = re.match(r"^(.+\.ts[x]?)\((\d+),\d+\): error TS[0-9]+: Object literal may only specify known properties, and 'per_page' does not exist.*", line)
        if m5:
            filepath, line_num = m5.group(1), int(m5.group(2))
            old, new = 'per_page', 'perPage'
            
        # Also fix PenerimaanPiutang and KasHarian specific rules
        m_jumlah = re.match(r"^(.*penerimaan-piutang\.service\.ts)\((\d+),\d+\): error TS2339: Property 'jumlahTerima' does not exist.*", line)
        if m_jumlah:
            filepath, line_num = m_jumlah.group(1), int(m_jumlah.group(2))
            old, new = 'jumlahTerima', '(cash_payment_amount + bca_payment_amount)'

        if filepath and line_num and old and new:
            try:
                with open(filepath, 'r') as f:
                    content_lines = f.readlines()
                idx = line_num - 1
                if 0 <= idx < len(content_lines):
                    content_lines[idx] = content_lines[idx].replace(f"{old}:", f"{new}:")
                    content_lines[idx] = content_lines[idx].replace(f"{old},", f"{new},")
                    content_lines[idx] = content_lines[idx].replace(f".{old}", f".{new}")
                    content_lines[idx] = content_lines[idx].replace(f" {old} ", f" {new} ")
                    with open(filepath, 'w') as f:
                        f.writelines(content_lines)
                print(f"Fixed {old} -> {new} in {filepath}:{line_num}")
            except Exception as e:
                pass

if __name__ == '__main__':
    main()
