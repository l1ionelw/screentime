using System;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace screentime;

public struct WINDOWINFO
{
    public uint ownerpid;
    public uint childpid;
}

public class WindowDetect
{
    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    private static extern IntPtr GetWindowThreadProcessId(IntPtr hWnd, out IntPtr lpdwProcessId);
    
    public string getCurrentAppName()
    {
        var activeAppHandle = GetForegroundWindow();
        IntPtr activeAppProcessId;
        GetWindowThreadProcessId(activeAppHandle, out activeAppProcessId);
        var currentAppProcess = Process.GetProcessById((int)activeAppProcessId);
        // TODO: Following string throws System.ComponentModel.Win32Exception - "Access is denied" exception
        var currentAppName = "";
        try
        {
            currentAppName = FileVersionInfo.GetVersionInfo(currentAppProcess.MainModule.FileName).FileDescription;
        }
        catch (Win32Exception ex)
        {
            Console.WriteLine("System.ComponentModel.Win32Exception: Can't get file description");
        }

        if (currentAppName == "Application Frame Host")
        {
            var TrueProcessName = UwpUtils.GetProcessName(GetForegroundWindow());
            Console.WriteLine(TrueProcessName);
            var TrueAppName = FileVersionInfo.GetVersionInfo(TrueProcessName).FileDescription;
            Debug.Write(TrueAppName);
            currentAppName = TrueAppName;
        }

        Console.WriteLine("dbeu5");
        return currentAppName;
    }
}

public class UwpUtils
{
    public static string GetProcessName(IntPtr hWnd)
    {
        string processName = null;

        hWnd = GetForegroundWindow();

        if (hWnd == IntPtr.Zero)
            return null;

        uint pID;
        GetWindowThreadProcessId(hWnd, out pID);

        IntPtr proc;
        if ((proc = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, (int)pID)) == IntPtr.Zero)
            return null;

        var capacity = 2000;
        var sb = new StringBuilder(capacity);
        QueryFullProcessImageName(proc, 0, sb, ref capacity);

        processName = sb.ToString(0, capacity);

        // UWP apps are wrapped in another app called, if this has focus then try and find the child UWP process
        if (Path.GetFileName(processName).Equals("ApplicationFrameHost.exe")) processName = UWP_AppName(hWnd, pID);

        return processName;
    }

    #region User32

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll", SetLastError = true)]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    // When you don't want the ProcessId, use this overload and pass IntPtr.Zero for the second parameter
    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr GetWindowThreadProcessId(IntPtr hWnd, IntPtr ProcessId);

    /// <summary>
    ///     Delegate for the EnumChildWindows method
    /// </summary>
    /// <param name="hWnd">Window handle</param>
    /// <param name="parameter">Caller-defined variable; we use it for a pointer to our list</param>
    /// <returns>True to continue enumerating, false to bail.</returns>
    public delegate bool EnumWindowProc(IntPtr hWnd, IntPtr parameter);

    [DllImport("user32", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool EnumChildWindows(IntPtr hWndParent, EnumWindowProc lpEnumFunc, IntPtr lParam);

    #endregion

    #region Kernel32

    public const uint PROCESS_QUERY_INFORMATION = 0x400;
    public const uint PROCESS_VM_READ = 0x010;

    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool QueryFullProcessImageName([In] IntPtr hProcess, [In] int dwFlags, [Out] StringBuilder lpExeName, ref int lpdwSize);

    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern IntPtr OpenProcess(
        uint dwDesiredAccess,
        [MarshalAs(UnmanagedType.Bool)] bool bInheritHandle,
        int dwProcessId
    );

    #endregion

    #region Get UWP Application Name

    /// <summary>
    ///     Find child process for uwp apps, edge, mail, etc.
    /// </summary>
    /// <param name="hWnd">hWnd</param>
    /// <param name="pID">pID</param>
    /// <returns>The application name of the UWP.</returns>
    private static string UWP_AppName(IntPtr hWnd, uint pID)
    {
        var windowinfo = new WINDOWINFO();
        windowinfo.ownerpid = pID;
        windowinfo.childpid = windowinfo.ownerpid;

        var pWindowinfo = Marshal.AllocHGlobal(Marshal.SizeOf(windowinfo));

        Marshal.StructureToPtr(windowinfo, pWindowinfo, false);

        EnumWindowProc lpEnumFunc = EnumChildWindowsCallback;
        EnumChildWindows(hWnd, lpEnumFunc, pWindowinfo);

        windowinfo = (WINDOWINFO)Marshal.PtrToStructure(pWindowinfo, typeof(WINDOWINFO));

        IntPtr proc;
        if ((proc = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, (int)windowinfo.childpid)) ==
            IntPtr.Zero)
            return null;

        var capacity = 2000;
        var sb = new StringBuilder(capacity);
        QueryFullProcessImageName(proc, 0, sb, ref capacity);

        Marshal.FreeHGlobal(pWindowinfo);

        return sb.ToString(0, capacity);
    }

    /// <summary>
    ///     Callback for enumerating the child windows.
    /// </summary>
    /// <param name="hWnd">hWnd</param>
    /// <param name="lParam">lParam</param>
    /// <returns>always <c>true</c>.</returns>
    private static bool EnumChildWindowsCallback(IntPtr hWnd, IntPtr lParam)
    {
        var info = (WINDOWINFO)Marshal.PtrToStructure(lParam, typeof(WINDOWINFO));

        uint pID;
        GetWindowThreadProcessId(hWnd, out pID);

        if (pID != info.ownerpid)
            info.childpid = pID;

        Marshal.StructureToPtr(info, lParam, true);

        return true;
    }

    #endregion
}