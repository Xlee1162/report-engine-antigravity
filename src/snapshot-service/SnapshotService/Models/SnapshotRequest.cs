using System.Collections.Generic;

namespace SnapshotService.Models
{
    public class SnapshotItem
    {
        public string type { get; set; } // "chart" | "range"
        public string sheet { get; set; }
        public string name { get; set; } // Chart Name or Range Address
        public string outputPath { get; set; }
    }

    public class SnapshotRequest
    {
        public string inputPath { get; set; }
        public List<SnapshotItem> items { get; set; }
    }
    
    public class SnapshotResponse 
    {
        public bool success { get; set; }
        public string message { get; set; }
    }
}
