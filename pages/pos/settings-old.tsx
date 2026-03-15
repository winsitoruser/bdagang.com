import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { FaPrint, FaCog } from 'react-icons/fa';
import { useTranslation } from '@/lib/i18n';

const POSSettingsPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');

    // Simulasi deteksi printer (dalam aplikasi nyata, ini akan menggunakan API printer yang sebenarnya)
    setTimeout(() => {
      const mockDetectedPrinters: DetectedPrinter[] = [
        {
          name: 'EPSON TM-T82',
          type: 'thermal',
          connection: 'usb',
          driver: 'EPSON TM-T82 Series',
          isDefault: true
        },
        {
          name: 'HP LaserJet Pro M404',
          type: 'laser',
          connection: 'network',
          driver: 'HP Universal Print Driver'
        },
        {
          name: 'Canon PIXMA TS3350',
          type: 'inkjet',
          connection: 'usb',
          driver: 'Canon TS3300 series'
        },
        {
          name: 'EPSON LX-310',
          type: 'dotmatrix',
          connection: 'usb',
          driver: 'EPSON LX-310 ESC/P'
        }
      ];

      setDetectedPrinters(mockDetectedPrinters);
      setIsDetectingPrinters(false);
    }, 3000);
  };

  // Fungsi untuk memilih printer yang terdeteksi
  const selectDetectedPrinter = (printer: DetectedPrinter) => {
    setPrinterSettings(prev => ({
      ...prev,
      printerName: printer.name,
      printerType: printer.type as any || prev.printerType,
      connectionType: printer.connection as any || prev.connectionType,
      driverName: printer.driver || prev.driverName
    }));

    toast({
      title: "Printer dipilih",
      description: `${printer.name} telah dipilih sebagai printer Anda.`,
    });

    setShowPrinterDetectionModal(false);
  };

  // Fungsi animasi saat memilih tipe printer
  const handlePrinterTypeChange = (value: string) => {
    // Animasi efek "pilih printer"
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    updatePrinterSetting('printerType', value);

    // Event untuk memicu animasi CSS
    const printerAnimContainer = document.getElementById('printer-animation-container');
    if (printerAnimContainer) {
      printerAnimContainer.classList.add('printer-type-changed');

      animationTimeoutRef.current = setTimeout(() => {
        printerAnimContainer.classList.remove('printer-type-changed');
      }, 1000);
    }
  };

  // Fungsi untuk memperbarui setting printer
  const updatePrinterSetting = (key: keyof PrinterSettings, value: any) => {
    setPrinterSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Fungsi untuk mengatur ulang pengaturan printer ke default
  const handleResetPrinterSettings = () => {
    setPrinterSettings(defaultPrinterSettings);
    toast({
      title: "Pengaturan Printer Diatur Ulang",
      description: "Semua pengaturan printer telah dikembalikan ke nilai default.",
    });
  };

  // Fungsi untuk menguji printer
  const handleTestPrint = () => {
    setIsTestingPrinter(true);
    
    // Simulasi print test (dalam aplikasi nyata, ini akan memanggil API printer)
    setTimeout(() => {
      setIsTestingPrinter(false);
      toast({
        title: "Test Print Berhasil",
        description: "Print test berhasil dikirim ke printer.",
      });
    }, 2000);
  };

  // Fungsi untuk menyimpan pengaturan printer
  const handleSavePrinterSettings = () => {
    // Simulasi menyimpan ke server (dalam aplikasi nyata, ini akan memanggil API)
    setTimeout(() => {
      toast({
        title: "Pengaturan Printer Disimpan",
        description: "Pengaturan printer berhasil disimpan.",
      });
    }, 500);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex flex-col flex-1 overflow-hidden">

        <style jsx global>{`
          .printer-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .printer-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          }
          
          .printer-type-card {
            border: 2px solid #e5e7eb;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .printer-type-card:hover {
            border-color: #f87171;
            background-color: #fff1f1;
          }
          
          .printer-type-card.active {
            border-color: #ef4444;
            background: linear-gradient(to bottom, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
          }
          
          .printer-icon {
            font-size: 2rem;
            color: #6b7280;
            transition: all 0.3s ease;
          }
          
          .printer-icon-thermal {
            color: #ef4444;
            animation: pulse 1s ease-in-out;
          }
          
          .printer-icon-inkjet {
            color: #3b82f6;
            animation: pulse 1s ease-in-out;
          }
          
          .printer-icon-laser {
            color: #10b981;
            animation: pulse 1s ease-in-out;
          }
          
          .printer-icon-dotmatrix {
            color: #8b5cf6;
            animation: pulse 1s ease-in-out;
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          
          .connecting-animation {
            position: relative;
            overflow: hidden;
          }
          
          .connecting-animation::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 50%;
            animation: loadingBar 2s infinite linear;
            background: linear-gradient(to right, transparent, #EF4444, transparent);
          }

          @keyframes loadingBar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="printer" className="w-full">
              <div className="flex justify-between items-center mb-6">
                <TabsList className="bg-white dark:bg-gray-800">
                  <TabsTrigger value="printer">Printer & Struk</TabsTrigger>
                  <TabsTrigger value="receipt">Desain Struk</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="printer" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Printer Selection Card */}
                  <Card className="col-span-3 md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FaPrint className="mr-2 text-red-500" />
                        Pengaturan Printer
                      </CardTitle>
                      <CardDescription>
                        Konfigurasi printer untuk mencetak struk dan dokumen lainnya
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500 flex items-center">
                            <FaSearch className="mr-1" /> Deteksi printer yang terhubung
                          </div>
                          <Button 
                            onClick={detectPrinters} 
                            variant="outline" 
                            size="sm"
                            disabled={isDetectingPrinters}
                            className="bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-700 hover:to-orange-600"
                          >
                            {isDetectingPrinters ? (
                              <>
                                <FaSync className="mr-2 animate-spin" /> Mendeteksi...
                              </>
                            ) : (
                              <>
                                <FaSearch className="mr-2" /> Deteksi Printer
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="printerName">Nama Printer</Label>
                          <div className="flex space-x-2">
                            <Input 
                              id="printerName" 
                              placeholder="Masukkan nama printer" 
                              value={printerSettings.printerName}
                              onChange={(e) => updatePrinterSetting('printerName', e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={detectPrinters}
                              title="Deteksi printer"
                            >
                              <FaSearch />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2" id="printer-animation-container">
                          <Label htmlFor="printerType">Jenis Printer</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div 
                              className={`printer-type-card rounded-lg p-4 flex flex-col items-center justify-center text-center ${printerSettings.printerType === 'thermal' ? 'active' : ''}`}
                              onClick={() => handlePrinterTypeChange('thermal')}
                            >
                              <div className={`printer-icon ${printerSettings.printerType === 'thermal' ? 'printer-icon-thermal' : ''} mb-2`}>
                                <FaPrint />
                              </div>
                              <h3 className="font-semibold">Thermal</h3>
                              <p className="text-xs text-gray-500 mt-1">Printer Struk</p>
                            </div>

                            <div 
                              className={`printer-type-card rounded-lg p-4 flex flex-col items-center justify-center text-center ${printerSettings.printerType === 'inkjet' ? 'active' : ''}`}
                              onClick={() => handlePrinterTypeChange('inkjet')}
                            >
                              <div className={`printer-icon ${printerSettings.printerType === 'inkjet' ? 'printer-icon-inkjet' : ''} mb-2`}>
                                <FaPrint />
                              </div>
                              <h3 className="font-semibold">Inkjet</h3>
                              <p className="text-xs text-gray-500 mt-1">Printer Tinta</p>
                            </div>

                            <div 
                              className={`printer-type-card rounded-lg p-4 flex flex-col items-center justify-center text-center ${printerSettings.printerType === 'laser' ? 'active' : ''}`}
                              onClick={() => handlePrinterTypeChange('laser')}
                            >
                              <div className={`printer-icon ${printerSettings.printerType === 'laser' ? 'printer-icon-laser' : ''} mb-2`}>
                                <FaPrint />
                              </div>
                              <h3 className="font-semibold">Laser</h3>
                              <p className="text-xs text-gray-500 mt-1">Printer Laser</p>
                            </div>

                            <div 
                              className={`printer-type-card rounded-lg p-4 flex flex-col items-center justify-center text-center ${printerSettings.printerType === 'dotmatrix' ? 'active' : ''}`}
                              onClick={() => handlePrinterTypeChange('dotmatrix')}
                            >
                              <div className={`printer-icon ${printerSettings.printerType === 'dotmatrix' ? 'printer-icon-dotmatrix' : ''} mb-2`}>
                                <FaPrint />
                              </div>
                              <h3 className="font-semibold">Dot Matrix</h3>
                              <p className="text-xs text-gray-500 mt-1">Printer Jarum</p>
                            </div>
                          </div>

                          <div className="hidden">
                            <Select 
                              value={printerSettings.printerType} 
                              onValueChange={handlePrinterTypeChange}
                            >
                              <SelectTrigger id="printerType" className="w-full">
                                <SelectValue placeholder="Pilih jenis printer" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="thermal">Thermal Printer</SelectItem>
                                <SelectItem value="inkjet">Inkjet Printer</SelectItem>
                                <SelectItem value="laser">Laser Printer</SelectItem>
                                <SelectItem value="dotmatrix">Dot Matrix Printer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {printerSettings.printerType === 'thermal' && (
                          <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
                            <h3 className="font-medium text-sm text-red-600">Pengaturan Printer Thermal</h3>
                            
                            {/* Model Printer Thermal */}
                            <div className="space-y-2">
                              <Label htmlFor="thermalModel">Model Printer Thermal</Label>
                              <Select 
                                value={printerSettings.thermalModel || 'placeholder'} 
                                onValueChange={(value) => updatePrinterSetting('thermalModel', value === 'placeholder' ? '' : value)}
                              >
                                <SelectTrigger id="thermalModel" className="w-full">
                                  <SelectValue placeholder="Pilih model printer" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                  <SelectItem value="placeholder">-- Pilih Model Printer --</SelectItem>
                                  {thermalPrinterModels.map((model) => (
                                    <SelectItem key={model.value} value={model.value}>
                                      {model.label} ({model.manufacturer})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Driver Profile */}
                            <div className="space-y-2">
                              <Label htmlFor="driverProfile">Driver Printer</Label>
                              <Select 
                                value={printerSettings.driverProfile || 'escpos'} 
                                onValueChange={(value) => updatePrinterSetting('driverProfile', value)}
                              >
                                <SelectTrigger id="driverProfile" className="w-full">
                                  <SelectValue placeholder="Pilih driver printer" />
                                </SelectTrigger>
                                <SelectContent>
                                  {thermalPrinterDrivers.map((driver) => (
                                    <SelectItem key={driver.value} value={driver.value}>
                                      {driver.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-gray-500">
                                {printerSettings.driverProfile === 'escpos' && 'ESC/POS adalah standar perintah untuk sebagian besar printer struk.'}
                                {printerSettings.driverProfile === 'star-line' && 'Mode baris Star Printer untuk kompatibilitas optimal dengan printer Star.'}
                                {printerSettings.driverProfile === 'epson-default' && 'Driver default Epson untuk printer Epson TM Series.'}
                                {printerSettings.driverProfile === 'custom-driver' && 'Gunakan driver kustom untuk printer non-standar.'}
                                {(!printerSettings.driverProfile || printerSettings.driverProfile === 'placeholder') && 'Pilih driver yang sesuai dengan printer Anda.'}
                              </p>
                            </div>
                            
                            {/* Paper Cutter Option */}
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="paperCutter" 
                                checked={printerSettings.paperCutter}
                                onCheckedChange={(checked) => 
                                  updatePrinterSetting('paperCutter', checked === true ? true : false)
                                }
                              />
                              <Label htmlFor="paperCutter" className="text-sm">
                                Aktifkan Auto-Cutter (Pemotong Kertas Otomatis)
                              </Label>
                            </div>
                            
                            {/* Thermal Printer List */}
                            <div className="space-y-2 mt-4">
                              <h3 className="font-medium text-sm text-red-600">Printer Thermal yang Didukung</h3>
                              <div className="border rounded-lg h-40 overflow-y-auto p-2">
                                <div className="space-y-1">
                                  {thermalPrinterModels.filter(m => m.value !== 'other').map((model) => (
                                    <div 
                                      key={model.value} 
                                      className={`p-2 text-sm rounded flex justify-between items-center hover:bg-gray-50 cursor-pointer ${printerSettings.thermalModel === model.value ? 'bg-red-50 border border-red-100' : ''}`}
                                      onClick={() => updatePrinterSetting('thermalModel', model.value)}
                                    >
                                      <span className="font-medium">{model.label}</span>
                                      <span className="text-xs text-gray-500">{model.manufacturer}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 italic">
                                Klik pada model untuk memilih. Jika printer Anda tidak ada dalam daftar, pilih "Printer Lainnya".
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="connectionType">Metode Koneksi</Label>
                          <div className="grid grid-cols-4 gap-2 mb-4">
                            <Button
                              type="button"
                              variant={printerSettings.connectionType === 'usb' ? 'default' : 'outline'}
                              className={`flex flex-col items-center justify-center h-20 ${printerSettings.connectionType === 'usb' ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white' : ''}`}
                              onClick={() => updatePrinterSetting('connectionType', 'usb')}
                            >
                              <FaUsb className="text-xl mb-1" />
                              <span className="text-xs">USB</span>
                            </Button>

                            <Button
                              type="button"
                              variant={printerSettings.connectionType === 'bluetooth' ? 'default' : 'outline'}
                              className={`flex flex-col items-center justify-center h-20 ${printerSettings.connectionType === 'bluetooth' ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white' : ''}`}
                              onClick={() => updatePrinterSetting('connectionType', 'bluetooth')}
                            >
                              <FaBluetooth className="text-xl mb-1" />
                              <span className="text-xs">Bluetooth</span>
                            </Button>

                            <Button
                              type="button"
                              variant={printerSettings.connectionType === 'network' ? 'default' : 'outline'}
                              className={`flex flex-col items-center justify-center h-20 ${printerSettings.connectionType === 'network' ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white' : ''}`}
                              onClick={() => updatePrinterSetting('connectionType', 'network')}
                            >
                              <FaNetworkWired className="text-xl mb-1" />
                              <span className="text-xs">Network</span>
                            </Button>

                            <Button
                              type="button"
                              variant={printerSettings.connectionType === 'serial' ? 'default' : 'outline'}
                              className={`flex flex-col items-center justify-center h-20 ${printerSettings.connectionType === 'serial' ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white' : ''}`}
                              onClick={() => updatePrinterSetting('connectionType', 'serial')}
                            >
                              <FaWrench className="text-xl mb-1" />
                              <span className="text-xs">Serial</span>
                            </Button>
                          </div>

                          <div className="hidden">
                            <Select 
                              value={printerSettings.connectionType} 
                              onValueChange={(value) => updatePrinterSetting('connectionType', value)}
                            >
                              <SelectTrigger id="connectionType" className="w-full">
                                <SelectValue placeholder="Pilih metode koneksi" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usb">USB</SelectItem>
                                <SelectItem value="bluetooth">Bluetooth</SelectItem>
                                <SelectItem value="network">Network</SelectItem>
                                <SelectItem value="serial">Serial</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {printerSettings.connectionType === 'network' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="ipAddress">Alamat IP</Label>
                              <Input 
                                id="ipAddress" 
                                placeholder="192.168.1.1" 
                                value={printerSettings.ipAddress}
                                onChange={(e) => updatePrinterSetting('ipAddress', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="port">Port</Label>
                              <Input 
                                id="port" 
                                placeholder="9100" 
                                value={printerSettings.port}
                                onChange={(e) => updatePrinterSetting('port', e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="driverName">Nama Driver</Label>
                          <Input 
                            id="driverName" 
                            placeholder="Nama driver printer"
                            value={printerSettings.driverName || ''}
                            onChange={(e) => updatePrinterSetting('driverName', e.target.value)}
                          />
                          <p className="text-xs text-gray-500">
                            Driver terdeteksi secara otomatis saat printer ditemukan.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={handleResetPrinterSettings}
                      >
                        <FaUndo className="mr-2" /> Atur Ulang
                      </Button>
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={handleTestPrint}
                          disabled={isTestingPrinter}
                        >
                          {isTestingPrinter ? (
                            <>
                              <FaSpinner className="mr-2 animate-spin" /> Testing...
                            </>
                          ) : (
                            <>
                              <FaPrint className="mr-2" /> Test Print
                            </>
                          )}
                        </Button>
                        <Button 
                          onClick={handleSavePrinterSettings}
                          className="bg-gradient-to-r from-red-600 to-orange-500 text-white"
                        >
                          <FaSave className="mr-2" /> Simpan
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab Desain Struk */}
              <TabsContent value="receipt" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Receipt Editor Card */}
                  <Card className="col-span-3 md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FaReceipt className="mr-2 text-red-500" />
                        Editor Struk
                      </CardTitle>
                      <CardDescription>
                        Desain format struk sesuai kebutuhan bisnis Anda
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-end mb-4 space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}>
                            <FaMinus className="mr-1" /> Perkecil
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setScale(1)}>
                            <FaExpand className="mr-1" /> Reset
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.min(prev + 0.1, 1.5))}>
                            <FaPlus className="mr-1" /> Perbesar
                          </Button>
                        </div>

                        <div className="bg-white border rounded-lg p-4 h-[500px] overflow-auto">
                          <div className="mx-auto" style={{ width: `${receiptSettings.paperWidth * 3.78}px`, transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                            <div className="bg-white border border-gray-200 p-4 shadow-sm" style={{ width: '100%' }}>
                              {/* Logo */}
                              {receiptSettings.showLogo && (
                                <div className="flex justify-center mb-3">
                                  {receiptSettings.logoUrl ? (
                                    <div className="h-16 flex items-center justify-center">
                                      <img 
                                        src={logoPreview || receiptSettings.logoUrl} 
                                        alt="Logo" 
                                        className="max-h-16 max-w-32 object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <div className="border border-dashed border-gray-300 rounded h-16 w-32 flex items-center justify-center">
                                      <FaImage className="text-gray-400" />
                                      <span className="text-xs text-gray-500 ml-1">Logo</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Header */}
                              <div className={`text-center mb-3`}>
                                <h2 className="font-bold text-lg">APOTEK FARMANESIA</h2>
                                {receiptSettings.showAddress && (
                                  <p className="text-sm">{receiptSettings.storeAddress}</p>
                                )}
                                {receiptSettings.showPhone && (
                                  <p className="text-sm">Telp: {receiptSettings.storePhone}</p>
                                )}
                                {receiptSettings.showEmail && (
                                  <p className="text-sm">Email: {receiptSettings.storeEmail}</p>
                                )}
                              </div>
                              
                              {/* Receipt Info */}
                              <div className="border-t border-b border-gray-300 py-2 mb-3">
                                <div className="flex justify-between text-sm">
                                  <span>No. Transaksi:</span>
                                  <span>INV-20230501-001</span>
                                </div>
                                {receiptSettings.showTimestamp && (
                                  <div className="flex justify-between text-sm">
                                    <span>Tanggal:</span>
                                    <span>01 Mei 2023 15:30</span>
                                  </div>
                                )}
                                {receiptSettings.showCashier && (
                                  <div className="flex justify-between text-sm">
                                    <span>Kasir:</span>
                                    <span>Admin</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Items */}
                              <div className="mb-3">
                                <div className={`text-${receiptSettings.itemsAlignment} text-sm font-medium mb-1`}>
                                  <div className="flex justify-between">
                                    <span className="w-5/12">Item</span>
                                    <span className="w-2/12 text-center">Qty</span>
                                    <span className="w-2/12 text-right">Harga</span>
                                    <span className="w-3/12 text-right">Subtotal</span>
                                  </div>
                                </div>
                                <div className="border-t border-gray-300 py-1"></div>
                                {/* Sample Items */}
                                <div className="text-sm">
                                  <div className="flex justify-between py-1">
                                    <span className="w-5/12">Paracetamol 500mg</span>
                                    <span className="w-2/12 text-center">2</span>
                                    <span className="w-2/12 text-right">10.000</span>
                                    <span className="w-3/12 text-right">20.000</span>
                                  </div>
                                  <div className="flex justify-between py-1">
                                    <span className="w-5/12">Amoxicillin 500mg</span>
                                    <span className="w-2/12 text-center">1</span>
                                    <span className="w-2/12 text-right">25.000</span>
                                    <span className="w-3/12 text-right">25.000</span>
                                  </div>
                                  <div className="flex justify-between py-1">
                                    <span className="w-5/12">Vitamin C 1000mg</span>
                                    <span className="w-2/12 text-center">1</span>
                                    <span className="w-2/12 text-right">35.000</span>
                                    <span className="w-3/12 text-right">35.000</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Totals */}
                              <div className="border-t border-gray-300 pt-2 mb-3">
                                <div className="flex justify-between text-sm">
                                  <span>Subtotal:</span>
                                  <span>80.000</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Diskon:</span>
                                  <span>0</span>
                                </div>
                                {receiptSettings.showVAT && (
                                  <div className="flex justify-between text-sm">
                                    <span>PPN (11%):</span>
                                    <span>8.800</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold text-sm mt-1">
                                  <span>Total:</span>
                                  <span>88.800</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                  <span>Tunai:</span>
                                  <span>100.000</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Kembali:</span>
                                  <span>11.200</span>
                                </div>
                              </div>
                              
                              {/* Thank You Message */}
                              {receiptSettings.showThankyouMessage && (
                                <div className={`text-${receiptSettings.footerAlignment} text-sm mt-4`}>
                                  <p>{receiptSettings.thankyouMessage}</p>
                                </div>
                              )}
                              
                              {/* Footer */}
                              {receiptSettings.showFooter && (
                                <div className={`text-${receiptSettings.footerAlignment} text-xs text-gray-500 mt-2`}>
                                  <p>{receiptSettings.footerText}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setReceiptSettings(defaultReceiptSettings)}>
                        <FaUndo className="mr-2" /> Atur Ulang
                      </Button>
                      <Button className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
                        <FaSave className="mr-2" /> Simpan
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Receipt Settings Card */}
                  <Card className="md:row-span-2 col-span-3 md:col-span-1">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <FaCog className="mr-2 text-red-500" />
                        Pengaturan Struk
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-5">
                        <div className="space-y-3">
                          <h3 className="font-medium text-sm">Konten Struk</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showLogo" className="text-sm">Tampilkan Logo</Label>
                              <Switch 
                                id="showLogo" 
                                checked={receiptSettings.showLogo}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showLogo: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showAddress" className="text-sm">Alamat</Label>
                              <Switch 
                                id="showAddress" 
                                checked={receiptSettings.showAddress}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showAddress: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showPhone" className="text-sm">Nomor Telepon</Label>
                              <Switch 
                                id="showPhone" 
                                checked={receiptSettings.showPhone}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showPhone: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showEmail" className="text-sm">Email</Label>
                              <Switch 
                                id="showEmail" 
                                checked={receiptSettings.showEmail}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showEmail: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showCashier" className="text-sm">Nama Kasir</Label>
                              <Switch 
                                id="showCashier" 
                                checked={receiptSettings.showCashier}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showCashier: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showTimestamp" className="text-sm">Tanggal & Waktu</Label>
                              <Switch 
                                id="showTimestamp" 
                                checked={receiptSettings.showTimestamp}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showTimestamp: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showVAT" className="text-sm">PPN</Label>
                              <Switch 
                                id="showVAT" 
                                checked={receiptSettings.showVAT}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showVAT: checked }))}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="font-medium text-sm">Pesan & Footer</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showThankyouMessage" className="text-sm">Pesan Terima Kasih</Label>
                              <Switch 
                                id="showThankyouMessage" 
                                checked={receiptSettings.showThankyouMessage}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showThankyouMessage: checked }))}
                              />
                            </div>
                            {receiptSettings.showThankyouMessage && (
                              <div className="space-y-1">
                                <Label htmlFor="thankyouMessage" className="text-sm">Teks Pesan</Label>
                                <Textarea 
                                  id="thankyouMessage" 
                                  placeholder="Masukkan pesan terima kasih" 
                                  value={receiptSettings.thankyouMessage}
                                  onChange={(e) => setReceiptSettings(prev => ({ ...prev, thankyouMessage: e.target.value }))}
                                  className="h-20"
                                />
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <Label htmlFor="showFooter" className="text-sm">Teks Footer</Label>
                              <Switch 
                                id="showFooter" 
                                checked={receiptSettings.showFooter}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showFooter: checked }))}
                              />
                            </div>
                            {receiptSettings.showFooter && (
                              <div className="space-y-1">
                                <Label htmlFor="footerText" className="text-sm">Teks Footer</Label>
                                <Textarea 
                                  id="footerText" 
                                  placeholder="Masukkan teks footer" 
                                  value={receiptSettings.footerText}
                                  onChange={(e) => setReceiptSettings(prev => ({ ...prev, footerText: e.target.value }))}
                                  className="h-20"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="font-medium text-sm">Format & Ukuran</h3>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <Label htmlFor="fontSize" className="text-sm">Ukuran Font</Label>
                                <span className="text-sm">{receiptSettings.fontSize}pt</span>
                              </div>
                              <Slider 
                                id="fontSize"
                                min={8} 
                                max={16} 
                                step={1}
                                value={[receiptSettings.fontSize]}
                                onValueChange={(value) => setReceiptSettings(prev => ({ ...prev, fontSize: value[0] }))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="paperWidth" className="text-sm">Lebar Kertas (mm)</Label>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className={receiptSettings.paperWidth === 58 ? 'bg-red-50 border-red-200' : ''}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, paperWidth: 58 }))}
                                >
                                  58mm
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className={receiptSettings.paperWidth === 80 ? 'bg-red-50 border-red-200' : ''}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, paperWidth: 80 }))}
                                >
                                  80mm
                                </Button>
                                <Input 
                                  type="number" 
                                  min={40} 
                                  max={210}
                                  value={receiptSettings.paperWidth}
                                  onChange={(e) => setReceiptSettings(prev => ({ ...prev, paperWidth: parseInt(e.target.value) }))}
                                  className="w-20"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="headerAlignment" className="text-sm">Perataan Header</Label>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className={`flex-1 ${receiptSettings.headerAlignment === 'left' ? 'bg-red-50 border-red-200' : ''}`}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, headerAlignment: 'left' }))}
                                >
                                  <FaAlignLeft className="mr-1" /> Kiri
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className={`flex-1 ${receiptSettings.headerAlignment === 'center' ? 'bg-red-50 border-red-200' : ''}`}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, headerAlignment: 'center' }))}
                                >
                                  <FaAlignCenter className="mr-1" /> Tengah
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className={`flex-1 ${receiptSettings.headerAlignment === 'right' ? 'bg-red-50 border-red-200' : ''}`}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, headerAlignment: 'right' }))}
                                >
                                  <FaAlignRight className="mr-1" /> Kanan
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="footerAlignment" className="text-sm">Perataan Footer</Label>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className={`flex-1 ${receiptSettings.footerAlignment === 'left' ? 'bg-red-50 border-red-200' : ''}`}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, footerAlignment: 'left' }))}
                                >
                                  <FaAlignLeft className="mr-1" /> Kiri
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className={`flex-1 ${receiptSettings.footerAlignment === 'center' ? 'bg-red-50 border-red-200' : ''}`}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, footerAlignment: 'center' }))}
                                >
                                  <FaAlignCenter className="mr-1" /> Tengah
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className={`flex-1 ${receiptSettings.footerAlignment === 'right' ? 'bg-red-50 border-red-200' : ''}`}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, footerAlignment: 'right' }))}
                                >
                                  <FaAlignRight className="mr-1" /> Kanan
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Logo Upload */}
                        {receiptSettings.showLogo && (
                          <div className="border-t pt-3 mt-3">
                            <h4 className="font-medium text-sm mb-2">Logo Struk</h4>
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center justify-center">
                                {logoPreview || receiptSettings.logoUrl ? (
                                  <div className="relative mb-2">
                                    <img 
                                      src={logoPreview || receiptSettings.logoUrl} 
                                      alt="Logo Preview" 
                                      className="max-h-16 max-w-full object-contain border rounded p-1" 
                                    />
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                                      onClick={() => {
                                        setLogoPreview(null);
                                        setReceiptSettings(prev => ({ ...prev, logoUrl: '' }));
                                        if (fileInputRef.current) {
                                          fileInputRef.current.value = '';
                                        }
                                      }}
                                    >
                                      <FaTrash size={12} />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-gray-300 rounded p-4 mb-2 flex items-center justify-center w-full">
                                    <FaImage className="text-gray-400 mr-2" />
                                    <span className="text-gray-500">Logo belum diunggah</span>
                                  </div>
                                )}
                              </div>
                              <input
                                type="file"
                                id="logo-upload"
                                className="hidden"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const result = event.target?.result as string;
                                      setLogoPreview(result);
                                      setReceiptSettings(prev => ({ ...prev, logoUrl: result }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <Button 
                                variant="outline" 
                                className="w-full" 
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <FaUpload className="mr-2" /> Unggah Logo
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {/* Address */}
                        {receiptSettings.showAddress && (
                          <div className="border-t pt-3 mt-3">
                            <h4 className="font-medium text-sm mb-2">Alamat Toko</h4>
                            <Textarea 
                              value={receiptSettings.storeAddress}
                              onChange={(e) => setReceiptSettings(prev => ({ ...prev, storeAddress: e.target.value }))}
                              className="resize-none text-sm"
                              placeholder="Masukkan alamat toko"
                              rows={2}
                            />
                          </div>
                        )}
                        
                        {/* Phone */}
                        {receiptSettings.showPhone && (
                          <div className="border-t pt-3 mt-3">
                            <h4 className="font-medium text-sm mb-2">Nomor Telepon</h4>
                            <Input 
                              value={receiptSettings.storePhone}
                              onChange={(e) => setReceiptSettings(prev => ({ ...prev, storePhone: e.target.value }))}
                              className="text-sm"
                              placeholder="Contoh: 021-1234567"
                            />
                          </div>
                        )}
                        
                        {/* Email */}
                        {receiptSettings.showEmail && (
                          <div className="border-t pt-3 mt-3">
                            <h4 className="font-medium text-sm mb-2">Email</h4>
                            <Input 
                              value={receiptSettings.storeEmail}
                              onChange={(e) => setReceiptSettings(prev => ({ ...prev, storeEmail: e.target.value }))}
                              className="text-sm"
                              placeholder="Contoh: info@tokoanda.com"
                              type="email"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>

      {/* Modal for printer detection */}
      <Dialog open={showPrinterDetectionModal} onOpenChange={setShowPrinterDetectionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FaPrint className="mr-2 text-red-500" />
              Deteksi Printer
            </DialogTitle>
            <DialogDescription>
              {isDetectingPrinters 
                ? "Mendeteksi printer yang terhubung ke sistem..." 
                : "Printer yang terdeteksi dan tersedia di sistem Anda."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isDetectingPrinters ? (
              <div className="space-y-4">
                <div className="connecting-animation h-2 w-full bg-gray-100 rounded"></div>
                <div className="text-center py-8">
                  <FaSync className="animate-spin mx-auto text-4xl text-red-500 mb-4" />
                  <p className="text-gray-700 font-medium">Mencari printer yang terhubung...</p>
                  <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-auto">
                {detectedPrinters.length === 0 ? (
                  <div className="text-center py-8">
                    <FaPrint className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-700 font-medium">Tidak ada printer yang terdeteksi</p>
                    <p className="text-sm text-gray-500 mt-2">Pastikan printer terhubung dan driver terinstal</p>
                  </div>
                ) : (
                  detectedPrinters.map((printer, index) => (
                    <div 
                      key={index}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => selectDetectedPrinter(printer)}
                    >
                      <div className="flex items-center">
                        <div className={`printer-icon printer-icon-${printer.type || 'thermal'} mr-3`}>
                          <FaPrint />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium flex items-center">
                            {printer.name}
                            {printer.isDefault && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Default</span>
                            )}
                          </h3>
                          <div className="text-sm text-gray-500 mt-1">
                            <div className="flex items-center">
                              <span className="capitalize">{printer.type || 'Unknown'}</span>
                              <span className="mx-1">•</span>
                              <span className="capitalize">{printer.connection || 'Unknown'}</span>
                            </div>
                            {printer.driver && (
                              <p className="text-xs text-gray-400 mt-1">Driver: {printer.driver}</p>
                            )}
                          </div>
                        </div>
                        <FaChevronRight className="text-gray-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => setShowPrinterDetectionModal(false)}
              disabled={isDetectingPrinters}
            >
              Batal
            </Button>
            {!isDetectingPrinters && (
              <Button onClick={detectPrinters} className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
                <FaSync className="mr-2" />
                Scan Ulang
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default dynamic(() => Promise.resolve(SettingsPage), {
  ssr: false
});
