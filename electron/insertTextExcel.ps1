param (
    [string]$text
)

# Попытка подключиться к открытому экземпляру Excel
try {
    $excel = [Runtime.Interopservices.Marshal]::GetActiveObject("Excel.Application")
} catch {
    Write-Output "Excel не запущен!"
    exit 1
}

$excel.Visible = $true

# Проверяем, есть ли активная книга
if ($excel.Workbooks.Count -eq 0) {
    Write-Output "Нет открытых книг в Excel!"
    exit 1
}

$workbook = $excel.ActiveWorkbook
$sheet = $workbook.ActiveSheet

# Проверяем, есть ли активная ячейка
if ($excel.Application.ActiveCell -eq $null) {
    Write-Output "Нет активной ячейки!"
    exit 1
}

# Вставляем текст в активную ячейку
$excel.Application.ActiveCell.Value = $text
