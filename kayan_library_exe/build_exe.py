#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
سكريبت بناء ملف EXE لبرنامج مكتبة ومطبعة كيان
Build Script for Kayan Library EXE

استخدام PyInstaller لإنشاء ملف EXE قابل للتشغيل على Windows
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def build_exe():
    """بناء ملف EXE"""
    
    print("🔨 بدء عملية بناء ملف EXE لبرنامج مكتبة ومطبعة كيان...")
    
    # التأكد من وجود PyInstaller
    try:
        import PyInstaller
        print("✅ PyInstaller متوفر")
    except ImportError:
        print("❌ PyInstaller غير مثبت. جاري التثبيت...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
        print("✅ تم تثبيت PyInstaller")
    
    # مسار الملف الرئيسي
    main_script = "main_exe.py"
    
    if not os.path.exists(main_script):
        print(f"❌ الملف {main_script} غير موجود!")
        return False
    
    # إعدادات PyInstaller
    pyinstaller_args = [
        "pyinstaller",
        "--onefile",                    # ملف واحد
        "--windowed",                   # بدون نافذة console
        "--name=KayanLibrary",          # اسم الملف النهائي
        "--icon=icon.ico",              # الأيقونة (إذا كانت متوفرة)
        "--add-data=icon.ico;.",        # إضافة الأيقونة للموارد
        "--hidden-import=sqlite3",      # استيراد مخفي لـ sqlite3
        "--hidden-import=tkinter",      # استيراد مخفي لـ tkinter
        "--hidden-import=tkinter.ttk",  # استيراد مخفي لـ ttk
        "--clean",                      # تنظيف الملفات المؤقتة
        main_script
    ]
    
    # إنشاء ملف spec مخصص
    spec_content = '''
# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['main_exe.py'],
    pathex=[],
    binaries=[],
    datas=[('icon.ico', '.') if os.path.exists('icon.ico') else None],
    hiddenimports=['sqlite3', 'tkinter', 'tkinter.ttk'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

# تصفية البيانات الفارغة
a.datas = [x for x in a.datas if x is not None]

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='KayanLibrary',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    version='version_info.txt',
    icon='icon.ico' if os.path.exists('icon.ico') else None,
)
'''
    
    # كتابة ملف spec
    with open('KayanLibrary.spec', 'w', encoding='utf-8') as f:
        f.write(spec_content)
    
    # إنشاء ملف معلومات الإصدار
    version_info = '''
# UTF-8
VSVersionInfo(
  ffi=FixedFileInfo(
    filevers=(1, 0, 0, 0),
    prodvers=(1, 0, 0, 0),
    mask=0x3f,
    flags=0x0,
    OS=0x40004,
    fileType=0x1,
    subtype=0x0,
    date=(0, 0)
  ),
  kids=[
    StringFileInfo(
      [
      StringTable(
        u'040904B0',
        [StringStruct(u'CompanyName', u'مكتبة ومطبعة كيان'),
        StringStruct(u'FileDescription', u'نظام إدارة مكتبة ومطبعة كيان'),
        StringStruct(u'FileVersion', u'1.0.0.0'),
        StringStruct(u'InternalName', u'KayanLibrary'),
        StringStruct(u'LegalCopyright', u'© 2024 مكتبة ومطبعة كيان'),
        StringStruct(u'OriginalFilename', u'KayanLibrary.exe'),
        StringStruct(u'ProductName', u'نظام إدارة مكتبة ومطبعة كيان'),
        StringStruct(u'ProductVersion', u'1.0.0.0')])
      ]),
    VarFileInfo([VarStruct(u'Translation', [1033, 1200])])
  ]
)
'''
    
    with open('version_info.txt', 'w', encoding='utf-8') as f:
        f.write(version_info)
    
    # إنشاء أيقونة افتراضية إذا لم تكن موجودة
    if not os.path.exists('icon.ico'):
        print("⚠️ لم يتم العثور على icon.ico، سيتم استخدام الأيقونة الافتراضية")
        # يمكن إنشاء أيقونة بسيطة هنا أو تجاهلها
    
    try:
        print("🔨 جاري بناء ملف EXE...")
        
        # تشغيل PyInstaller
        result = subprocess.run(['pyinstaller', 'KayanLibrary.spec'], 
                              capture_output=True, text=True, encoding='utf-8')
        
        if result.returncode == 0:
            print("✅ تم بناء ملف EXE بنجاح!")
            
            # نسخ الملف النهائي
            exe_path = Path("dist/KayanLibrary.exe")
            if exe_path.exists():
                # إنشاء مجلد الإصدار النهائي
                release_dir = Path("release")
                release_dir.mkdir(exist_ok=True)
                
                # نسخ الملف
                shutil.copy2(exe_path, release_dir / "KayanLibrary.exe")
                
                # إنشاء ملف README
                readme_content = """
# برنامج مكتبة ومطبعة كيان
## Kayan Library & Printing Management System

### 🚀 طريقة التشغيل:
1. قم بتشغيل ملف KayanLibrary.exe
2. سيتم إنشاء مجلد البيانات تلقائياً في: C:\\Users\\[اسم المستخدم]\\KayanLibrary
3. ابدأ في استخدام البرنامج!

### 📋 المتطلبات:
- Windows 10 أو أحدث
- لا يتطلب تثبيت Python أو أي برامج إضافية

### 🔧 الميزات:
- إدارة شاملة للمنتجات والمخزون
- نظام فواتير متكامل
- إدارة العملاء والموردين
- تقارير مفصلة
- نسخ احتياطي تلقائي
- واجهة عربية سهلة الاستخدام

### 📞 الدعم الفني:
- البريد الإلكتروني: support@kayan.com
- الهاتف: 966xxxxxxxxx

---
© 2024 مكتبة ومطبعة كيان - جميع الحقوق محفوظة
"""
                
                with open(release_dir / "README.txt", 'w', encoding='utf-8') as f:
                    f.write(readme_content)
                
                print(f"📁 الملفات النهائية متوفرة في: {release_dir.absolute()}")
                print(f"📦 حجم الملف: {exe_path.stat().st_size / (1024*1024):.1f} MB")
                
                return True
            else:
                print("❌ لم يتم العثور على ملف EXE في مجلد dist")
                return False
        else:
            print("❌ فشل في بناء ملف EXE:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ خطأ أثناء بناء ملف EXE: {e}")
        return False
    
    finally:
        # تنظيف الملفات المؤقتة
        cleanup_files = ['KayanLibrary.spec', 'version_info.txt']
        cleanup_dirs = ['build', '__pycache__']
        
        for file in cleanup_files:
            if os.path.exists(file):
                os.remove(file)
                print(f"🧹 تم حذف {file}")
        
        for dir in cleanup_dirs:
            if os.path.exists(dir):
                shutil.rmtree(dir)
                print(f"🧹 تم حذف مجلد {dir}")

def install_requirements():
    """تثبيت المتطلبات"""
    requirements = [
        'pyinstaller>=5.0',
        'pillow>=9.0.0',
    ]
    
    print("📦 جاري تثبيت المتطلبات...")
    for req in requirements:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", req])
            print(f"✅ تم تثبيت {req}")
        except subprocess.CalledProcessError:
            print(f"❌ فشل في تثبيت {req}")
            return False
    
    return True

def main():
    """الدالة الرئيسية"""
    print("=" * 60)
    print("🏪 مرحباً بك في أداة بناء برنامج مكتبة ومطبعة كيان")
    print("=" * 60)
    
    # تثبيت المتطلبات
    if not install_requirements():
        print("❌ فشل في تثبيت المتطلبات")
        return
    
    # بناء ملف EXE
    if build_exe():
        print("\n" + "=" * 60)
        print("🎉 تم بناء البرنامج بنجاح!")
        print("📁 يمكنك العثور على الملفات في مجلد 'release'")
        print("🚀 يمكنك الآن توزيع ملف KayanLibrary.exe")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("❌ فشل في بناء البرنامج")
        print("🔍 تحقق من الأخطاء أعلاه وحاول مرة أخرى")
        print("=" * 60)

if __name__ == "__main__":
    main()
