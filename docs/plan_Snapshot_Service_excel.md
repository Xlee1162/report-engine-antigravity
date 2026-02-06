🎯 Mục tiêu Snapshot Service

Biến Excel (chart / range) → ảnh (PNG/JPEG) để nhúng vào email / report

Yêu cầu ngầm nhưng cực quan trọng:

Excel COM chỉ chạy ổn định khi:

1 Excel instance / 1 process

Không đa luồng COM

Có thể scale theo nhu cầu (nhiều report / nhiều user)

Node.js / AI / RPA chỉ gọi – không đụng Excel

🧠 Tư duy kiến trúc (WHY trước)
❌ Vì sao KHÔNG chạy song song Excel COM trong 1 process?

Excel COM STA (Single Thread Apartment)

Chạy song song:

treo Excel

ghost process

file bị lock

crash ngẫu nhiên (rất khó debug)

👉 Luật bất thành văn:

1 process = 1 Excel COM = xử lý tuần tự

✅ Giải pháp chuẩn

👉 Snapshot Service = worker đơn nhiệm

Mỗi instance:

1 queue

xử lý từng job một

Scale = nhân bản service, không nhân thread

🧱 Kiến trúc tổng thể
Node.js / AI / Scheduler
        |
        | HTTP / IPC
        v
+----------------------+
| Snapshot Service #1  |  <-- Excel COM
+----------------------+

+----------------------+
| Snapshot Service #2  |  <-- Excel COM
+----------------------+

+----------------------+
| Snapshot Service #N  |
+----------------------+


Node.js:

load-balance

retry

timeout

không cần biết Excel hoạt động thế nào

🧩 Snapshot Service – Chọn loại app
👉 Windows Service (khuyên dùng)

Chạy nền

Ổn định

Có thể auto-restart

(Dev/debug thì chạy Console App cũng OK)

📁 Cấu trúc project (Skeleton)
SnapshotService
│
├─ Program.cs
├─ App.config
│
├─ Api/
│   └─ SnapshotController.cs
│
├─ Core/
│   ├─ SnapshotJob.cs
│   ├─ SnapshotResult.cs
│   └─ SnapshotQueue.cs
│
├─ Excel/
│   ├─ ExcelApplicationHost.cs
│   ├─ ExcelSnapshotEngine.cs
│   └─ ExcelCleanup.cs
│
├─ Services/
│   ├─ SnapshotWorker.cs
│   └─ JobDispatcher.cs
│
└─ Utils/
    ├─ FileHelper.cs
    └─ Logger.cs

🧠 Luồng xử lý CHUẨN
HTTP Request
   ↓
Validate
   ↓
Enqueue Job
   ↓
SnapshotWorker (single thread)
   ↓
Open Excel
   ↓
Load file
   ↓
Render chart / range
   ↓
Export image
   ↓
Cleanup Excel COM
   ↓
Return result

🧩 Định nghĩa Job
public class SnapshotJob
{
    public string JobId { get; set; }

    public string ExcelPath { get; set; }
    public string SheetName { get; set; }

    // Chart OR Range
    public string ChartName { get; set; }
    public string RangeAddress { get; set; }

    public string OutputImagePath { get; set; }
}

🧵 Queue – CHỈ 1 worker
public class SnapshotQueue
{
    private readonly BlockingCollection<SnapshotJob> _queue 
        = new BlockingCollection<SnapshotJob>();

    public void Enqueue(SnapshotJob job)
        => _queue.Add(job);

    public SnapshotJob Take(CancellationToken token)
        => _queue.Take(token);
}

⚙️ Worker – tim của service
public class SnapshotWorker
{
    private readonly SnapshotQueue _queue;

    public SnapshotWorker(SnapshotQueue queue)
    {
        _queue = queue;
    }

    public void Start(CancellationToken token)
    {
        Task.Run(() =>
        {
            while (!token.IsCancellationRequested)
            {
                var job = _queue.Take(token);
                Process(job);
            }
        }, token);
    }

    private void Process(SnapshotJob job)
    {
        using (var excel = new ExcelApplicationHost())
        {
            var engine = new ExcelSnapshotEngine(excel);
            engine.Render(job);
        }
    }
}

📊 Excel COM Host (CỰC KỲ QUAN TRỌNG)
public class ExcelApplicationHost : IDisposable
{
    public Excel.Application App { get; private set; }

    public ExcelApplicationHost()
    {
        App = new Excel.Application
        {
            Visible = false,
            DisplayAlerts = false
        };
    }

    public void Dispose()
    {
        try
        {
            App.Quit();
        }
        finally
        {
            ExcelCleanup.Release(App);
        }
    }
}

🖼️ Render Chart → Image
public void RenderChart(
    Excel.Workbook wb,
    string sheetName,
    string chartName,
    string outputPath)
{
    var sheet = (Excel.Worksheet)wb.Sheets[sheetName];
    var chartObj = sheet.ChartObjects(chartName);
    chartObj.Chart.Export(outputPath, "PNG");
}

🧹 Cleanup COM – SỐNG CÒN
public static class ExcelCleanup
{
    public static void Release(object com)
    {
        if (com != null && Marshal.IsComObject(com))
            Marshal.ReleaseComObject(com);
    }
}

🔥 Nguyên tắc VÀNG khi scale
Khi cần scale:

❌ Không tăng thread

❌ Không tăng task song song

✅ Làm đúng:

Chạy N instance Snapshot Service

Node.js:

round-robin

retry instance khác nếu timeout

🧠 Vì sao mô hình này “ăn tiền”

✔ Excel COM ổn định
✔ Debug được
✔ Scale tuyến tính
✔ Dễ bọc AI / Copilot / RPA
✔ Chuẩn enterprise (BI / Reporting / Banking đều dùng kiểu này)

👉 Bước tiếp theo (mình đề xuất)

Nếu bạn muốn, mình có thể:

Viết API contract (OpenAPI / JSON) cho Snapshot Service

Viết Node.js client gọi service

Viết AI prompt chuẩn để Copilot / GPT hiểu và sinh code đúng skeleton này

Chuyển skeleton thành Windows Service thực thụ