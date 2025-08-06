import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useGoCardless, type Bank } from '@/hooks/useGoCardless'
import { Loader2, Building2, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BankConnectionProps {
  onAccountConnected?: (accountId: string) => void
}

export const BankConnection = ({ onAccountConnected }: BankConnectionProps) => {
  const [banks, setBanks] = useState<Bank[]>([])
  const [selectedBank, setSelectedBank] = useState<string>('')
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [requisitionId, setRequisitionId] = useState<string>('')
  
  const { getBanks, createBankConnection, getRequisitionStatus, loading, error } = useGoCardless()
  const { toast } = useToast()

  useEffect(() => {
    loadBanks()
  }, [])

  useEffect(() => {
    // Check for requisition completion from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const reqId = urlParams.get('ref')
    
    if (reqId && connectionStatus === 'connecting') {
      checkRequisitionStatus(reqId)
    }
  }, [connectionStatus])

  const loadBanks = async () => {
    try {
      console.log('Loading banks...')
      const bankList = await getBanks('GB') // Default to UK banks
      console.log('Banks loaded:', bankList)
      setBanks(bankList)
    } catch (err) {
      console.error('Error loading banks:', err)
      toast({
        title: "Error loading banks",
        description: error || "Failed to load available banks",
        variant: "destructive"
      })
    }
  }

  const handleConnectBank = async () => {
    if (!selectedBank) return
    
    try {
      setConnectionStatus('connecting')
      const requisition = await createBankConnection(selectedBank)
      setRequisitionId(requisition.id)
      
      // Redirect user to bank's authentication page
      window.location.href = requisition.link
    } catch (err) {
      setConnectionStatus('error')
      toast({
        title: "Connection failed",
        description: error || "Failed to connect to bank",
        variant: "destructive"
      })
    }
  }

  const checkRequisitionStatus = async (reqId: string) => {
    try {
      const requisition = await getRequisitionStatus(reqId)
      
      if (requisition.status === 'LN' && requisition.accounts?.length > 0) {
        setConnectionStatus('connected')
        onAccountConnected?.(requisition.accounts[0])
        toast({
          title: "Bank connected successfully!",
          description: "Your bank account is now linked"
        })
      } else if (requisition.status === 'RJ') {
        setConnectionStatus('error')
        toast({
          title: "Connection rejected",
          description: "Bank connection was rejected or cancelled",
          variant: "destructive"
        })
      }
    } catch (err) {
      setConnectionStatus('error')
      toast({
        title: "Status check failed",
        description: "Failed to verify bank connection status",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Building2 className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Connecting to bank...'
      case 'connected':
        return 'Bank connected successfully'
      case 'error':
        return 'Connection failed'
      default:
        return 'Ready to connect'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Connect Your Bank Account
        </CardTitle>
        <CardDescription>
          Securely connect your bank account to import real transaction data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {getStatusText()}
          </Badge>
        </div>

        {connectionStatus === 'idle' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select your bank</label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      <div className="flex items-center gap-2">
                        {bank.logo && (
                          <img src={bank.logo} alt={bank.name} className="w-4 h-4" />
                        )}
                        {bank.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleConnectBank}
              disabled={!selectedBank || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Bank Account'
              )}
            </Button>
          </div>
        )}

        {connectionStatus === 'error' && (
          <Button 
            onClick={() => setConnectionStatus('idle')}
            variant="outline"
            className="w-full"
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}