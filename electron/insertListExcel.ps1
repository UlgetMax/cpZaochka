param (
    [string]$students
)

try {
    $excel = [Runtime.Interopservices.Marshal]::GetActiveObject("Excel.Application")
} catch {
    $excel = New-Object -ComObject Excel.Application
}

$excel.Visible = $true

if ($excel.Workbooks.Count -gt 0) {
    $workbook = $excel.ActiveWorkbook
} else {
    $workbook = $excel.Workbooks.Add()
}

$sheet = $workbook.Sheets.Item(1)

# Декодируем JSON-строку обратно в массив
$studentsArray = $students | ConvertFrom-Json
$row = 1

foreach ($student in $studentsArray) {
    $sheet.Cells.Item($row, 1).Value = $student
    $row++
}
