param (
    [string]$text,
    [int]$row,
    [int]$column
)

# Попытка подключиться к открытому экземпляру Excel, если он уже запущен
try {
    $excel = [Runtime.Interopservices.Marshal]::GetActiveObject("Excel.Application")
} catch {
    $excel = New-Object -ComObject Excel.Application
}

$excel.Visible = $true

# Получаем активную рабочую книгу, если она существует
if ($excel.Workbooks.Count -gt 0) {
    $workbook = $excel.ActiveWorkbook
} else {
    # Если нет открытых рабочих книг, создаем новый
    $workbook = $excel.Workbooks.Add()
}

# Получаем первый лист
$sheet = $workbook.Sheets.Item(1)

# Вставляем текст в указанную ячейку
$sheet.Cells.Item($row, $column).Value = $text
